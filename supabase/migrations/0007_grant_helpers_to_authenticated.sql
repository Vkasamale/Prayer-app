-- Prayer App — Flood Church
-- Patch: give the team back the helpers its own policies depend on.
--
-- 0006 revoked is_team_member() and is_leadership() from everyone, on the
-- reasoning that policies and views run as the definer so no caller needs the
-- privilege. That reasoning was wrong. A row-level security policy expression is
-- evaluated as the *calling* role, so every signed-in team member needs execute
-- on the helpers their own policies call.
--
-- The symptom was the prayer team's list failing to load with
-- "permission denied for function is_team_member", while the congregation's side
-- kept working — submit_prayer is security definer and calls neither helper.
--
-- Locking out the public also locked out the team. anon and public stay
-- revoked; authenticated gets the privilege back and nothing more.

begin;

grant execute on function is_team_member() to authenticated;
grant execute on function is_leadership() to authenticated;

commit;

-- Verification: the team can call them, the public cannot.
do $check$
begin
  if not has_function_privilege('authenticated', 'is_team_member()', 'execute') then
    raise exception 'The team still cannot call is_team_member()';
  end if;

  if not has_function_privilege('authenticated', 'is_leadership()', 'execute') then
    raise exception 'The team still cannot call is_leadership()';
  end if;

  if has_function_privilege('anon', 'is_team_member()', 'execute')
     or has_function_privilege('anon', 'is_leadership()', 'execute') then
    raise exception 'The anon role can still call the helpers';
  end if;

  raise notice 'OK: helpers open to the team, closed to the public key.';
end $check$;
