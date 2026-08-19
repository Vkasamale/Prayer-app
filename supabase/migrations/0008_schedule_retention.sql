-- Prayer App — Flood Church
-- Schedule the retention job.
--
-- purge_expired_submissions() has existed since 0001 and has never run. Until
-- now the 90-day retention policy was a promise the app made on its own pages
-- and did not keep. This is what makes it true.
--
-- Runs inside the database on pg_cron rather than from a web request. Nothing
-- needs deploying, no endpoint exists to be called by mistake, and it keeps
-- running whether or not anyone visits the site. The function stays revoked from
-- every application role: pg_cron runs it as the scheduler, so no browser ever
-- needs the privilege.
--
-- What it does: 90 days after the prayer team marks a request prayed over, the
-- body text is cleared and redacted_at is stamped. The row itself stays, so the
-- dashboard counts remain true after the words are gone. Contact details are
-- never touched — those are kept indefinitely and removed only on request.

create extension if not exists pg_cron;

-- Unschedule first, so this file can be re-run without stacking duplicate jobs.
do $guard$
begin
  if exists (select 1 from cron.job where jobname = 'purge-expired-submissions') then
    perform cron.unschedule('purge-expired-submissions');
  end if;
end $guard$;

-- 03:15 every day. Nightly rather than weekly so nothing sits past its window for
-- six extra days, and off the hour to avoid the crowd of jobs everybody schedules
-- at exactly midnight.
select cron.schedule(
  'purge-expired-submissions',
  '15 3 * * *',
  $job$ select purge_expired_submissions(); $job$
);

-- Verification: the job exists, is active, and nothing else can reach the
-- function.
do $check$
declare
  v_active boolean;
begin
  select active into v_active from cron.job where jobname = 'purge-expired-submissions';

  if v_active is null then
    raise exception 'The retention job was not scheduled';
  end if;

  if not v_active then
    raise exception 'The retention job exists but is not active';
  end if;

  if has_function_privilege('anon', 'purge_expired_submissions()', 'execute') then
    raise exception 'The anon role can call purge_expired_submissions()';
  end if;

  raise notice 'OK: retention runs nightly at 03:15, and no browser can trigger it.';
end $check$;

-- To see what it has done:
--   select jobname, status, start_time, return_message
--     from cron.job_run_details
--    where jobname = 'purge-expired-submissions'
--    order by start_time desc limit 10;
