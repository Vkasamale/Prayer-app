-- Prayer App — Flood Church
-- Two additions for the team side:
--   1. Contact details for counseling requests, visible to leadership only.
--   2. Time windows on the dashboard counts.

begin;

-- ---------------------------------------------------------------------------
-- 1. Counseling follow-up
--
-- Someone can already tick "I would like someone to talk to" and leave a phone
-- number, and until now no screen showed it. The app was making an offer it
-- could not keep.
--
-- This view is the only place a phone number is ever exposed, and only to
-- leadership. The prayer team's own view still shows a first name and nothing
-- more.
--
-- Anonymous counseling requests are deliberately absent: there is nobody to
-- ring, and listing them here would only show leadership a name-shaped hole.
-- They stay in the prayer list, where they are prayed for like any other.
-- ---------------------------------------------------------------------------

create view counseling_for_leadership with (security_invoker = off) as
  select
    s.id,
    s.body,
    s.categories,
    s.created_at,
    s.prayed_over_at,
    sub.first_name,
    sub.last_name,
    sub.phone
  from submissions s
  join submitters sub on sub.id = s.submitter_id
  where s.kind = 'counseling'
    and is_leadership();

revoke all on counseling_for_leadership from public, anon, authenticated;
grant select on counseling_for_leadership to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Dashboard time windows
--
-- The counts were all-time only. The team wants a week and a month as well, so
-- the same figures can be read as movement rather than one growing total.
--
-- p_days null means all time. Dropped and recreated rather than replaced, since
-- adding a parameter changes the signature.
-- ---------------------------------------------------------------------------

drop function if exists dashboard_stats();
drop function if exists dashboard_stats(integer);

create function dashboard_stats(p_days integer default null)
returns table (
  submissions_total        integer,
  submissions_waiting      integer,
  submissions_prayed_over  integer,
  counseling_requests      integer,

  -- Distinct people, as closely as this app can honestly tell. Anonymous
  -- submitters are counted by browser id, which undercounts: a cleared browser
  -- or a second device reads as someone new. It is a floor, never a headcount.
  submitters_distinct      integer,
  submitters_named         integer,
  submitters_anonymous     integer,

  members_yes              integer,
  members_no               integer,
  members_unanswered       integer
)
language sql stable security definer set search_path = public, pg_catalog as $fn$
  select
    count(*)::integer,
    count(*) filter (where prayed_over_at is null)::integer,
    count(*) filter (where prayed_over_at is not null)::integer,
    count(*) filter (where kind = 'counseling')::integer,

    count(distinct browser_id)::integer,
    count(distinct submitter_id)::integer,
    count(distinct browser_id) filter (where submitter_id is null)::integer,

    count(*) filter (where is_member = 'yes')::integer,
    count(*) filter (where is_member = 'no')::integer,
    count(*) filter (where is_member is null)::integer
  from submissions
  -- The guard. security definer means this function reads past row-level
  -- security, so it must check for itself who is asking. A caller who is not on
  -- the team matches no rows, and gets zeroes back.
  where is_team_member()
    and (
      p_days is null
      or created_at >= now() - make_interval(days => p_days)
    );
$fn$;

revoke all on function dashboard_stats(integer) from public, anon, authenticated;
grant execute on function dashboard_stats(integer) to authenticated;

commit;

-- Verification: the public key holds nothing, and contact details stay shut to
-- an ordinary prayer team member as well.
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

  if has_function_privilege('anon', 'dashboard_stats(integer)', 'execute') then
    raise exception 'The anon role can call dashboard_stats()';
  end if;

  raise notice 'OK: counseling contacts are leadership-only, counts take a window.';
end $check$;
