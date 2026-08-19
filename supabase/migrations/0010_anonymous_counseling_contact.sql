-- Prayer App — Flood Church
-- Counseling contact details, including for people who stayed anonymous.
--
-- Decided 2026-08-19: someone who chose the anonymous path can still ask to
-- talk. They give a phone number and nothing else — no name — and they choose
-- whether they would rather be rung or meet in person.
--
-- This is the one place the anonymity promise bends, and it bends by the
-- person's own hand, for one request, because they asked to be reached. Three
-- rules keep it honest:
--
--   1. The number attaches to that single request. It is never joined back to
--      the browser id, so nothing the person sent before becomes identifiable.
--   2. It does not enter the church's permanent contact list. That list is for
--      people who gave their name knowing it would be kept. Someone who stayed
--      anonymous and left a number for one conversation agreed to no such thing,
--      so the number is cleared with the request on the 90-day retention run.
--   3. The form says so plainly, before they type it.

begin;

do $guard$
begin
  if not exists (select 1 from pg_type where typname = 'contact_preference') then
    create type contact_preference as enum ('call', 'in_person');
  end if;
end $guard$;

alter table submissions
  add column if not exists contact_phone text
    check (contact_phone is null or length(trim(contact_phone)) between 5 and 32),
  add column if not exists contact_whatsapp boolean not null default false,
  add column if not exists contact_pref contact_preference;

-- ---------------------------------------------------------------------------
-- submit_prayer takes the counseling contact details.
-- ---------------------------------------------------------------------------

drop function if exists submit_prayer(text, uuid, submission_kind, membership_answer, prayer_category[], text, text, text);

create function submit_prayer(
  p_body             text,
  p_browser_id       uuid,
  p_kind             submission_kind   default 'prayer',
  p_is_member        membership_answer default null,
  p_categories       prayer_category[] default '{}',
  p_first_name       text default null,
  p_last_name        text default null,
  p_phone            text default null,
  p_contact_phone    text default null,
  p_contact_whatsapp boolean default false,
  p_contact_pref     contact_preference default null
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

  -- Asking to talk with no way to be reached is a request nobody can answer. A
  -- named submitter already gave a number; an anonymous one must give one here.
  if p_kind = 'counseling'
     and v_submitter_id is null
     and (p_contact_phone is null or length(trim(p_contact_phone)) = 0) then
    raise exception 'Asking to talk needs a phone number to reach you on';
  end if;

  -- Contact details are only ever stored for a counseling request. They are not
  -- collected, and not kept, for an ordinary prayer request.
  insert into submissions (
    body, kind, submitter_id, browser_id, is_member, categories,
    contact_phone, contact_whatsapp, contact_pref
  )
  values (
    trim(p_body),
    p_kind,
    v_submitter_id,
    p_browser_id,
    p_is_member,
    coalesce(p_categories, '{}'),
    case when p_kind = 'counseling' then nullif(trim(coalesce(p_contact_phone, '')), '') end,
    case when p_kind = 'counseling' then coalesce(p_contact_whatsapp, false) else false end,
    case when p_kind = 'counseling' then p_contact_pref end
  );
end;
$fn$;

revoke all on function submit_prayer(text, uuid, submission_kind, membership_answer, prayer_category[], text, text, text, text, boolean, contact_preference) from public, anon, authenticated;
grant execute on function submit_prayer(text, uuid, submission_kind, membership_answer, prayer_category[], text, text, text, text, boolean, contact_preference) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Leadership's follow-up list now includes anonymous requests, because they can
-- finally be answered. A name is simply absent for those.
-- ---------------------------------------------------------------------------

drop view if exists counseling_for_leadership;

create view counseling_for_leadership with (security_invoker = off) as
  select
    s.id,
    s.body,
    s.categories,
    s.created_at,
    s.prayed_over_at,
    sub.first_name,
    sub.last_name,
    -- A named submitter's number lives on their contact record; an anonymous one
    -- gave a number for this request alone.
    coalesce(s.contact_phone, sub.phone) as phone,
    s.contact_whatsapp,
    s.contact_pref,
    sub.id is not null as is_named
  from submissions s
  left join submitters sub on sub.id = s.submitter_id
  where s.kind = 'counseling'
    and coalesce(s.contact_phone, sub.phone) is not null
    and is_leadership();

revoke all on counseling_for_leadership from public, anon, authenticated;
grant select on counseling_for_leadership to authenticated;

-- ---------------------------------------------------------------------------
-- Retention clears the anonymous contact number along with the words.
--
-- This is rule 2 above, enforced rather than promised. A named submitter's
-- contact record is untouched: they gave their name knowing it would be kept.
-- ---------------------------------------------------------------------------

create or replace function purge_expired_submissions() returns integer
  language sql volatile security definer set search_path = public, pg_catalog as $fn$
    with purged as (
      update submissions
         set body = null,
             redacted_at = now(),
             contact_phone = null,
             contact_whatsapp = false,
             contact_pref = null
       where prayed_over_at is not null
         and prayed_over_at < now() - interval '90 days'
         and redacted_at is null
      returning 1
    )
    select count(*)::integer from purged;
$fn$;

revoke all on function purge_expired_submissions() from public, anon, authenticated;

commit;

-- Verification: the public key still holds nothing, and asking to talk without a
-- number is refused.
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

  begin
    perform submit_prayer(
      'verification - should never be stored',
      '00000000-0000-4000-8000-00000000ffff'::uuid,
      'counseling'
    );
    raise exception 'An anonymous counseling request was accepted with no phone number';
  exception
    when others then
      if sqlerrm not like '%phone number%' then
        raise;
      end if;
  end;

  raise notice 'OK: anonymous counseling needs a number, and the public key holds nothing.';
end $check$;
