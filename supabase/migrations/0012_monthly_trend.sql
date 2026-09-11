-- Prayer App — Flood Church
-- How many requests came in each month.
--
-- The dashboard's time windows answer "how much lately". They cannot answer
-- "is this growing", because each window replaces the last. A trend is a
-- different question and needs its own query.
--
-- Counts only, as with dashboard_stats: no bodies, no names, nothing about an
-- individual. A month with three requests in it tells the church how the thing
-- is being used, and tells nobody anything about who used it.
--
-- Redacted rows still count. After ninety days the words are gone but the row
-- remains, so history does not quietly rewrite itself as it ages.

begin;

create or replace function monthly_stats(p_months integer default 12)
  returns table (month date, requests integer, counseling integer)
  language plpgsql stable security definer set search_path = public, pg_catalog as $fn$
begin
  -- A policy would filter rows; this function returns aggregates, so the check
  -- has to be here or it is not anywhere.
  if not is_team_member() then
    raise exception 'Not permitted';
  end if;

  return query
    with months as (
      select date_trunc('month', now())::date - (make_interval(months => offset_n))::interval as m
        from generate_series(0, greatest(p_months, 1) - 1) as offset_n
    )
    select
      m::date,
      count(s.id)::integer,
      count(s.id) filter (where s.kind = 'counseling')::integer
    from months
    left join submissions s
      on s.created_at >= m
     and s.created_at < m + interval '1 month'
    group by m
    order by m;
end;
$fn$;

revoke all on function monthly_stats(integer) from public, anon, authenticated;
grant execute on function monthly_stats(integer) to authenticated;

commit;

-- Verification: the public key cannot call it, and a signed-in stranger is
-- refused even though the grant lets them try.
do $check$
declare v_leak text;
begin
  if has_function_privilege('anon', 'monthly_stats(integer)', 'execute') then
    raise exception 'The public key can read the trend';
  end if;

  select string_agg(table_name || '.' || privilege_type, ', ')
    into v_leak
    from information_schema.role_table_grants
   where grantee = 'anon' and table_schema = 'public';

  if v_leak is not null then
    raise exception 'The anon role has direct table access: %', v_leak;
  end if;

  raise notice 'OK: the trend is team-only.';
end $check$;
