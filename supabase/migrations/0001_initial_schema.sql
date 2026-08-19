-- Prayer App — Flood Church
-- Initial schema, row-level security, and write path.
--
-- Design rules this file enforces, from PROJECT_BRIEF.md:
--   1. Anonymous means anonymous. An anonymous submission carries no link to a
--      person. There is no column here that could later be joined back to one.
--   2. The public never touches these tables directly. The congregation submits
--      through submit_prayer() and has no table privileges at all.
--   3. Contact details are leadership-only. The prayer team sees a first name so
--      they can pray by name, and never a phone number.
--   4. Clearing a prayer request must not change the dashboard counts.

begin;

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------

create type submission_kind as enum ('prayer', 'counseling');
create type membership_answer as enum ('yes', 'no');
create type team_role as enum ('prayer_team', 'leadership');

-- A null membership_answer means the person did not answer. The question is
-- optional and "Prefer not to say" is a real choice, so null is the single
-- representation of "did not say" rather than a third enum value.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- Contact details for people who chose the named path. Kept indefinitely as the
-- church's pastoral contact list. Leadership only. Nothing is ever written here
-- for someone who chose anonymous.
create table submitters (
  id          uuid primary key default gen_random_uuid(),
  first_name  text not null check (length(trim(first_name)) between 1 and 100),
  last_name   text not null check (length(trim(last_name))  between 1 and 100),
  phone       text not null check (length(trim(phone))      between 5 and 32),
  created_at  timestamptz not null default now()
);

create table submissions (
  id            uuid primary key default gen_random_uuid(),
  body          text check (body is null or length(body) between 1 and 5000),
  kind          submission_kind not null default 'prayer',

  -- Null means the submission is anonymous. This is the only marker of
  -- anonymity: there is deliberately no separate is_anonymous flag that could
  -- drift out of step with the actual link.
  --
  -- On delete set null, so honouring a removal request detaches that person's
  -- past requests rather than destroying the prayer team's counts.
  submitter_id  uuid references submitters (id) on delete set null,

  -- Opaque per-browser identifier generated client-side and kept in
  -- localStorage. Not a person. Carries no name, phone, IP or fingerprint. It
  -- exists only to count distinct submitters and group repeat requests, and it
  -- undercounts by design: a cleared browser is a new id, and that is the
  -- accepted cost of the anonymity promise.
  browser_id    uuid not null,

  is_member     membership_answer,

  prayed_over_at timestamptz,
  flagged_urgent boolean not null default false,

  -- Set when the body text is cleared by the retention policy. The row survives
  -- so the counts stay true after the words are gone.
  redacted_at   timestamptz,
  created_at    timestamptz not null default now(),

  -- A redacted row has no body; an unredacted row must have one.
  constraint body_present_unless_redacted
    check ((redacted_at is null) = (body is not null))
);

create index submissions_created_at_idx   on submissions (created_at desc);
create index submissions_unprayed_idx     on submissions (created_at desc) where prayed_over_at is null;
create index submissions_browser_id_idx   on submissions (browser_id);
create index submissions_submitter_id_idx on submissions (submitter_id);

-- Who may sign in on the team side. Rows are created by hand in the Supabase
-- dashboard after inviting the user. There is no self-signup.
create table team_members (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  role       team_role not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Role helpers
--
-- security definer, so a policy on submissions can ask "is this user
-- leadership?" without the caller needing read access to team_members.
-- search_path is pinned so the function cannot be redirected by its caller.
-- ---------------------------------------------------------------------------

create function is_team_member() returns boolean
  language sql stable security definer set search_path = public, pg_catalog as $fn$
    select exists (select 1 from team_members where user_id = auth.uid());
$fn$;

create function is_leadership() returns boolean
  language sql stable security definer set search_path = public, pg_catalog as $fn$
    select exists (
      select 1 from team_members where user_id = auth.uid() and role = 'leadership'
    );
$fn$;

-- ---------------------------------------------------------------------------
-- The public write path
--
-- The congregation has no table privileges. This function is the entire public
-- surface of the database. It writes the submitter row and the submission row
-- together, so a caller cannot attach their text to somebody else's identity,
-- cannot mark anything prayed over, and cannot flag anything urgent.
--
-- Passing first name, last name and phone means the named path. Passing nulls
-- means the anonymous path, and no submitter row is created at all.
-- ---------------------------------------------------------------------------

create function submit_prayer(
  p_body       text,
  p_browser_id uuid,
  p_kind       submission_kind   default 'prayer',
  p_is_member  membership_answer default null,
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

  insert into submissions (body, kind, submitter_id, browser_id, is_member)
  values (trim(p_body), p_kind, v_submitter_id, p_browser_id, p_is_member);
end;
$fn$;

revoke all on function submit_prayer(text, uuid, submission_kind, membership_answer, text, text, text) from public;
grant execute on function submit_prayer(text, uuid, submission_kind, membership_answer, text, text, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row-level security
--
-- Every table is deny-by-default. The anon role is granted nothing at all, so
-- even if a policy below were mistakenly written too permissively, the public
-- client has no table access with which to exercise it.
-- ---------------------------------------------------------------------------

alter table submitters   enable row level security;
alter table submissions  enable row level security;
alter table team_members enable row level security;

revoke all on submitters, submissions, team_members from anon, authenticated;
grant select, update, delete on submissions  to authenticated;
grant select, update, delete on submitters   to authenticated;
grant select                 on team_members to authenticated;

-- Submissions: any team member reads, updates (mark prayed over, flag urgent)
-- and deletes junk. Nobody inserts through the table; that is submit_prayer's job.
create policy submissions_team_select on submissions for select to authenticated using (is_team_member());
create policy submissions_team_update on submissions for update to authenticated using (is_team_member()) with check (is_team_member());
create policy submissions_team_delete on submissions for delete to authenticated using (is_team_member());

-- Contact details: leadership only. A prayer team member querying this table
-- gets zero rows back, not an error.
create policy submitters_leadership_select on submitters for select to authenticated using (is_leadership());
create policy submitters_leadership_update on submitters for update to authenticated using (is_leadership()) with check (is_leadership());
create policy submitters_leadership_delete on submitters for delete to authenticated using (is_leadership());

-- A team member may see their own role; leadership sees the whole team.
create policy team_members_self_select on team_members for select to authenticated using (user_id = auth.uid() or is_leadership());

-- ---------------------------------------------------------------------------
-- What the prayer team actually reads
--
-- The prayer team needs a first name so they can pray by name, and must not see
-- a phone number. Row-level security cannot hide a single column, so the join
-- happens here instead, in a view exposing the name and nothing else.
--
-- security_invoker = off is deliberate: the view reaches into submitters on the
-- caller's behalf, which is the entire point of it. Its own guard is the
-- is_team_member() check in the where clause.
-- ---------------------------------------------------------------------------

create view submissions_for_team with (security_invoker = off) as
  select
    s.id,
    s.body,
    s.kind,
    s.is_member,
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

-- Supabase grants privileges on new objects in the public schema to anon and
-- authenticated by default, and that applies to views as well as tables. Revoke
-- before granting, or the public key can reach this view.
revoke all on submissions_for_team from anon, authenticated;
grant select on submissions_for_team to authenticated;

-- ---------------------------------------------------------------------------
-- Retention
--
-- Request text is cleared 90 days after the prayer team marks it prayed over.
-- The row itself stays, so every count on the dashboard remains true after the
-- words are gone. Contact details are never touched by this: they are kept
-- indefinitely and removed only on request.
-- ---------------------------------------------------------------------------

create function purge_expired_submissions() returns integer
  language sql volatile security definer set search_path = public, pg_catalog as $fn$
    with purged as (
      update submissions
         set body = null, redacted_at = now()
       where prayed_over_at is not null
         and prayed_over_at < now() - interval '90 days'
         and redacted_at is null
      returning 1
    )
    select count(*)::integer from purged;
$fn$;

revoke all on function purge_expired_submissions() from public;

-- NOT SCHEDULED YET. This function does nothing until something calls it. Wire
-- it to pg_cron in the Supabase dashboard, or to a Vercel cron route, before
-- launch — otherwise the retention policy is a promise the app does not keep.

commit;

-- ---------------------------------------------------------------------------
-- Verification
--
-- Fails loudly if the public client can reach any table directly. This is the
-- mistake that would expose every prayer request in the church, so it is
-- checked rather than assumed.
-- ---------------------------------------------------------------------------

do $check$
declare
  v_leak text;
  v_unprotected text;
begin
  select string_agg(table_name || '.' || privilege_type, ', ')
    into v_leak
    from information_schema.role_table_grants
   where grantee = 'anon' and table_schema = 'public';

  if v_leak is not null then
    raise exception 'The anon role has direct table access: %', v_leak;
  end if;

  select string_agg(tablename, ', ')
    into v_unprotected
    from pg_tables
   where schemaname = 'public'
     and tablename in ('submissions', 'submitters', 'team_members')
     and not rowsecurity;

  if v_unprotected is not null then
    raise exception 'Row-level security is off on: %', v_unprotected;
  end if;

  raise notice 'OK: no public table access, row-level security on all tables.';
end $check$;
