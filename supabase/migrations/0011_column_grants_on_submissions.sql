-- Prayer App — Flood Church
-- The prayer team may not read counseling contact details, and may not rewrite
-- what a person wrote.
--
-- Found by audit on 2026-09-11, before any real account existed beyond
-- leadership's. `counseling_for_leadership` is gated on is_leadership(), and
-- that gate works — but it guarded the front door only. The underlying
-- `submissions` table carried `select` for the whole `authenticated` role under
-- a policy of `is_team_member()`, which is true for every role including
-- `prayer_team`. PostgREST exposes that table directly, so any prayer team
-- member signed into the site could have read every counseling phone number
-- with one request from the browser console:
--
--   GET /rest/v1/submissions?select=contact_phone,contact_whatsapp,contact_pref
--
-- Including the numbers of people who chose to stay anonymous and left a number
-- for one conversation with leadership. That is the single promise this app
-- makes, so this is the most serious defect found so far.
--
-- Row-level security cannot fix it: RLS filters rows, and the leak is a column.
-- Column-level grants are the mechanism that fits. The leadership view keeps
-- working because it is `security_invoker = off` and runs as its owner, so it
-- reads the contact columns on leadership's behalf without the caller needing
-- them.
--
-- The same reasoning applies to writing. The team had `update` on every column,
-- so a member could have rewritten the body of somebody's prayer request, or
-- set a contact number that was never given. They only ever need to change two
-- fields, so they are granted two.

begin;

revoke select, update on submissions from authenticated;

-- Everything except contact_phone, contact_whatsapp and contact_pref.
grant select (
  id, body, kind, submitter_id, browser_id, is_member,
  prayed_over_at, flagged_urgent, redacted_at, created_at, categories
) on submissions to authenticated;

-- The two things a tick changes, and nothing else.
grant update (prayed_over_at, flagged_urgent) on submissions to authenticated;

commit;

-- Verification: the contact columns are unreachable to the team, the two
-- writable ones are still writable, and the public key still holds nothing.
do $check$
declare
  v_leak text;
  v_bad  text;
begin
  select string_agg(column_name, ', ')
    into v_leak
    from information_schema.column_privileges
   where grantee = 'authenticated'
     and table_name = 'submissions'
     and column_name in ('contact_phone', 'contact_whatsapp', 'contact_pref');

  if v_leak is not null then
    raise exception 'The team can still reach counseling contact details: %', v_leak;
  end if;

  select string_agg(column_name, ', ')
    into v_bad
    from information_schema.column_privileges
   where grantee = 'authenticated'
     and table_name = 'submissions'
     and privilege_type = 'UPDATE'
     and column_name not in ('prayed_over_at', 'flagged_urgent');

  if v_bad is not null then
    raise exception 'The team can still rewrite: %', v_bad;
  end if;

  if not exists (
    select 1 from information_schema.column_privileges
     where grantee = 'authenticated' and table_name = 'submissions'
       and privilege_type = 'UPDATE' and column_name = 'prayed_over_at'
  ) then
    raise exception 'The team can no longer mark a request prayed over';
  end if;

  select string_agg(table_name || '.' || privilege_type, ', ')
    into v_leak
    from information_schema.role_table_grants
   where grantee = 'anon' and table_schema = 'public';

  if v_leak is not null then
    raise exception 'The anon role has direct table access: %', v_leak;
  end if;

  raise notice 'OK: contact details are leadership-only, and the team writes two columns.';
end $check$;
