-- Prayer App — Flood Church
-- Patch: finish what 0005 started.
--
-- 0005 revoked the helper functions from anon and authenticated but not from
-- public, so the implicit grant every function is created with was still there
-- and anon still reached them through it. That is the same mistake 0005 was
-- written to fix, made one line further down.
--
-- rls_auto_enable is deliberately untouched. It belongs to Supabase, not to this
-- app, and revoking privileges on platform functions risks breaking tooling that
-- depends on them. The check below is scoped to our own functions for that
-- reason: a check that fails on something we must not change teaches the team to
-- ignore it.

begin;

revoke all on function is_team_member()            from public, anon, authenticated;
revoke all on function is_leadership()             from public, anon, authenticated;
revoke all on function purge_expired_submissions() from public, anon, authenticated;
revoke all on function dashboard_stats()           from public, anon, authenticated;

-- The team's own calls go back, for the signed-in role only.
grant execute on function dashboard_stats() to authenticated;

-- Corrected in 0007: this file originally left is_team_member() and
-- is_leadership() closed to everyone, reasoning that policies run as the
-- definer. They do not — a row-level security policy expression is evaluated as
-- the calling role, so the team needs execute on the helpers its own policies
-- call, and revoking from everyone locked the team out along with the public.
grant execute on function is_team_member() to authenticated;
grant execute on function is_leadership() to authenticated;
--
-- purge_expired_submissions() stays closed too. Retention is a scheduled job,
-- never something triggered from a browser.

commit;

-- Verification: of the functions this app defines, the public key may call
-- submit_prayer and nothing else.
do $check$
declare
  v_leak text;
  v_functions text;
begin
  select string_agg(table_name || '.' || privilege_type, ', ')
    into v_leak
    from information_schema.role_table_grants
   where grantee = 'anon' and table_schema = 'public';

  if v_leak is not null then
    raise exception 'The anon role has direct table access: %', v_leak;
  end if;

  select string_agg(p.proname, ', ')
    into v_functions
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public'
     and p.proname in (
       'is_team_member',
       'is_leadership',
       'purge_expired_submissions',
       'dashboard_stats'
     )
     and has_function_privilege('anon', p.oid, 'execute');

  if v_functions is not null then
    raise exception 'The anon role can still call: %', v_functions;
  end if;

  raise notice 'OK: anon holds no tables, and no functions but submit_prayer.';
end $check$;
