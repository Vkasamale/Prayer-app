# Next session

## 0. Do this first — the live site is broken until you do

Run `supabase/migrations/0010_anonymous_counseling_contact.sql` in the Supabase
SQL editor.

The deployed form calls `submit_prayer` with the new contact parameters, and the
database function does not have them yet, so **every submission on
send-a-prayer.vercel.app fails** until 0010 is applied. Not only counseling ones.

Then confirm it worked:

```
npm run verify
```

That script may itself need updating for the new signature — it was written
against the older one. Fixing it is the second task.

## 1. Confirm which migrations are actually applied

Applied and confirmed during the last session: 0001–0007, 0009.
Uncertain: **0008** (the retention schedule). Check with:

```sql
select jobname, schedule, active from cron.job;
```

If nothing comes back, run `0008_schedule_retention.sql`. Without it the 90-day
deletion the app promises on its own pages does not happen.

## 2. Clear the test rows

Two obvious markers were used: `WALKTHROUGH TEST%` and `AUTOMATED CHECK%` in the
body, plus a submitter with the last name `Deleteme`. Remove those rows from
`submissions` and `submitters` in the SQL editor.

## 3. Point Supabase auth at the live address

Supabase dashboard → Authentication → URL Configuration. Set **Site URL** to
`https://send-a-prayer.vercel.app` and add it to **Redirect URLs**, or team
sign-in will not work on the deployed site. It has only ever been tested on
localhost.

## 4. Test the counseling paths

Never run against real data. Both need checking once 0010 is in:

- Anonymous, ticking "I would like someone to talk to", leaving only a number
- Named, same
- Leadership tab shows both, with the WhatsApp and meet-in-person markers

## Where the project stands

Live at **https://send-a-prayer.vercel.app**, public, not announced, no QR code
printed.

Built and tested end to end: the identity choice, the submission form with
categories, the prayer team's grouped list, dashboard counts with time windows,
and the leadership counseling view.

Every decision made so far, with its reasoning, is in `PROJECT_BRIEF.md` sections
10a–10h. `ROADMAP.md` has the phases. `BACKLOG.md` says what is deliberately not
being built and why.

## Still to build

1. **QR code** — Phase 2, small, and the last thing before a real trial
2. **Print-ready QR material** for the church
3. **A real test run** with 2-3 prayer team members, per the roadmap

## Open questions nobody has answered

- Should an anonymous person be told, before ticking the counseling box, that
  they cannot be reached without a number? The form says so at the field, but not
  before the choice.
- Does the prayer team want several category groups open at once? Only one opens
  at a time today, which suits working through a theme but not comparing.

## Watch out for

- **Never run `npx next build` while the dev server is running.** It overwrites
  `.next` underneath the running server, and the app starts throwing module
  errors that look like real bugs. It cost time twice last session. Use
  `npx tsc --noEmit` to check types instead.
- **Supabase grants new objects in `public` to `anon` by default.** Every new
  table, view or function needs an explicit
  `revoke ... from public, anon, authenticated`. Revoking `from public` alone is
  not enough. This caused four separate defects last session; the checks at the
  bottom of each migration are what caught them, so keep writing them.
- **Row-level security policy expressions run as the calling role**, so the
  `authenticated` role needs `execute` on any helper function a policy calls.
- **Apply the migration before pushing code that depends on it.** The live site
  is currently broken for exactly that reason.
