-- Prayer App — Flood Church
-- Patch: take the public role off submissions_for_team.
--
-- Only needed if 0001 committed before its verification block failed. If the
-- tables do not exist yet, skip this file and run the corrected 0001 instead.
--
-- Supabase grants privileges on new objects in the public schema to anon and
-- authenticated by default, and that covers views as well as tables. 0001
-- revoked those on the three tables but not on the view, leaving the public key
-- able to reach submissions_for_team.
--
-- No prayer requests were exposed by this: the view's own where is_team_member()
-- clause returns no rows to an anonymous caller, and the view joins two tables
-- so it is not auto-updatable and cannot be written through. But that is a
-- single guard, and this design deliberately leaves the public role holding
-- nothing at all.

begin;

revoke all on submissions_for_team from anon, authenticated;
grant select on submissions_for_team to authenticated;

commit;

-- Same verification as 0001. A notice and no exception means clean.
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
