-- Prayer App — Flood Church
-- Counts for the prayer team's dashboard.
--
-- These are counts for the team's own workload, not analytics on people. No
-- name, phone, request text or browser id leaves this function — only totals.
-- See PROJECT_BRIEF.md section 10a for why that distinction is the whole point.
--
-- It exists as a function rather than being counted in the browser because
-- counting distinct submitters client-side would mean fetching every row.

begin;

create function dashboard_stats()
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
  where is_team_member();
$fn$;

-- from public alone is not enough: Supabase grants execute to anon and
-- authenticated explicitly through default privileges, and that grant survives.
revoke all on function dashboard_stats() from public, anon, authenticated;
grant execute on function dashboard_stats() to authenticated;

commit;

-- Verification: the public key must not be able to call this.
do $check$
begin
  if has_function_privilege('anon', 'dashboard_stats()', 'execute') then
    raise exception 'The anon role can call dashboard_stats()';
  end if;
  raise notice 'OK: dashboard_stats is closed to the public key.';
end $check$;
