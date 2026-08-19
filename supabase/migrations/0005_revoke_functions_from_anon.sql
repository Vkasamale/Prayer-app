-- Prayer App — Flood Church
-- Patch: take the public role off every function except the one it needs.
--
-- 0001 and 0003 revoked function privileges `from public`, which removes only
-- the implicit grant every function is created with. Supabase additionally
-- grants execute to anon and authenticated explicitly, through default
-- privileges, and that grant survived. So those revokes did less than they
-- appeared to.
--
-- dashboard_stats() is what tripped the check, and it is the least of it.
-- purge_expired_submissions() clears the body text of every request past its
-- retention window, and the public key could call it — a key that ships in the
-- browser of anyone who scans the QR code.
--
-- No data has been destroyed, and reaching any of this needs the anon key. But
-- this is exactly the kind of gap that stays invisible until someone looks.
--
-- submit_prayer keeps its anon grant. That one is deliberate: it is how the
-- congregation submits, and it is the entire public surface of this database.

begin;

-- public must be named alongside anon. Revoking from anon alone leaves the
-- implicit grant every function carries, and anon reaches the function through
-- it. Corrected here; 0006 exists because the first version of this file got
-- that wrong.
revoke all on function dashboard_stats()           from public, anon, authenticated;
revoke all on function purge_expired_submissions() from public, anon, authenticated;
revoke all on function is_team_member()            from public, anon, authenticated;
revoke all on function is_leadership()             from public, anon, authenticated;

-- The team's own call goes back, for the signed-in role only.
grant execute on function dashboard_stats() to authenticated;

-- is_team_member() and is_leadership() stay revoked from everyone. They are
-- called from inside policies and views, which run as the definer, so no caller
-- needs the privilege directly.
--
-- purge_expired_submissions() stays revoked from everyone too. Retention is a
-- scheduled job, not something a person triggers from a browser.

commit;

-- Verification: anon must hold nothing — no table, and no function but
-- submit_prayer.
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
    raise exception 'The anon role can call: %', v_functions;
  end if;

  raise notice 'OK: anon holds no tables, and no functions but submit_prayer.';
end $check$;
