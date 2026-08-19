-- Prayer App — Flood Church
-- Prayer categories, chosen by the person submitting.
--
-- Decided 2026-08-19: the submitter picks, not an AI. The congregation wants
-- this to stay person to person, and automatic grouping would mean sending
-- prayer requests to an outside company. See BACKLOG.md.
--
-- Multiple categories per request, because real requests are rarely about one
-- thing: someone out of work is asking about provision, and family, and faith,
-- in the same paragraph. A single category would misfile most of them.
--
-- Every category is optional. An untouched request is stored as an empty array
-- and shown to the prayer team under "Not sorted", which is a real state and not
-- a failure — it matters more that someone in distress can send their words than
-- that they classify them first.

begin;

-- Guarded so this file can be re-run: the first attempt failed partway through,
-- at the view, and how much of it landed depends on whether the editor wrapped
-- the whole file in its own transaction.
do $guard$
begin
  if not exists (select 1 from pg_type where typname = 'prayer_category') then
    create type prayer_category as enum (
      'health',
      'mental_health',
      'provision',
      'work_studies',
      'family',
      'relationships',
      'grief',
      'guidance',
      'faith',
      'someone_i_love',
      'protection',
      'thanks',
      'other'
    );
  end if;
end $guard$;

alter table submissions
  add column if not exists categories prayer_category[] not null default '{}';

-- Lets the team view pull "everything touching provision" without scanning
-- every row once the list grows.
create index if not exists submissions_categories_idx on submissions using gin (categories);

-- submit_prayer gains a categories argument. Dropped and recreated rather than
-- replaced: adding a parameter changes the signature, and a bare CREATE OR
-- REPLACE would leave the old version in place as a second overload.
drop function if exists submit_prayer(text, uuid, submission_kind, membership_answer, text, text, text);
drop function if exists submit_prayer(text, uuid, submission_kind, membership_answer, prayer_category[], text, text, text);

create function submit_prayer(
  p_body       text,
  p_browser_id uuid,
  p_kind       submission_kind   default 'prayer',
  p_is_member  membership_answer default null,
  p_categories prayer_category[] default '{}',
  p_first_name text default null,
  p_last_name  text default null,
  p_phone      text default null
) returns void
  language plpgsql volatile security definer set search_path = public, pg_catalog as $fn$
declare
  v_submitter_id uuid;
  v_named boolean := p_first_name is not null
                  or p_last_name  is not null
                  or p_phone      is not null;
begin
  if p_body is null or length(trim(p_body)) = 0 then
    raise exception 'A prayer request cannot be empty';
  end if;

  -- Named means all three, or it is not the named path. Half-filled contact
  -- details would leave the prayer team unable to reach someone who asked to be
  -- reached, which is worse than not offering the option at all.
  if v_named then
    if p_first_name is null or p_last_name is null or p_phone is null then
      raise exception 'The named path requires a first name, last name and phone number';
    end if;

    insert into submitters (first_name, last_name, phone)
    values (trim(p_first_name), trim(p_last_name), trim(p_phone))
    returning id into v_submitter_id;
  end if;

  insert into submissions (body, kind, submitter_id, browser_id, is_member, categories)
  values (
    trim(p_body),
    p_kind,
    v_submitter_id,
    p_browser_id,
    p_is_member,
    coalesce(p_categories, '{}')
  );
end;
$fn$;

revoke all on function submit_prayer(text, uuid, submission_kind, membership_answer, prayer_category[], text, text, text) from public, anon, authenticated;
grant execute on function submit_prayer(text, uuid, submission_kind, membership_answer, prayer_category[], text, text, text) to anon, authenticated;

-- The prayer team's view carries the categories through, so the Wednesday
-- meeting can work theme by theme instead of one request at a time.
--
-- Dropped rather than replaced. CREATE OR REPLACE VIEW can only append columns
-- at the end, and categories belongs beside the other request fields, so
-- replacing it in place fails with "cannot change name of view column".
drop view if exists submissions_for_team;

create view submissions_for_team with (security_invoker = off) as
  select
    s.id,
    s.body,
    s.kind,
    s.is_member,
    s.categories,
    s.prayed_over_at,
    s.flagged_urgent,
    s.redacted_at,
    s.created_at,
    s.submitter_id is not null as is_named,
    sub.first_name,
    -- Deliberately no phone number and no surname. Leadership reads those from
    -- the submitters table directly.
    s.browser_id
  from submissions s
  left join submitters sub on sub.id = s.submitter_id
  where is_team_member();

-- Recreating a view resets its privileges, and Supabase grants new objects to
-- anon by default. Revoke again, or this reopens the hole 0002 closed.
revoke all on submissions_for_team from anon, authenticated;
grant select on submissions_for_team to authenticated;

commit;

-- Verification: the public key must still hold nothing.
do $check$
declare
  v_leak text;
begin
  select string_agg(table_name || '.' || privilege_type, ', ')
    into v_leak
    from information_schema.role_table_grants
   where grantee = 'anon' and table_schema = 'public';

  if v_leak is not null then
    raise exception 'The anon role has direct table access: %', v_leak;
  end if;

  raise notice 'OK: categories added, public key still holds nothing.';
end $check$;
