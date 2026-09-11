# Next session

## THE AGENDA

### What Vincent needs to do, shortest first

1. **Create one ordinary prayer team account**, role `prayer_team`, not
   leadership. Supabase dashboard → Authentication → Users → Add user, then tell
   the agent the email and it will add the `team_members` row.

   This is the last untested boundary in the product: that a prayer team member
   can read the prayer list but **cannot** see counseling phone numbers. It
   cannot be faked in SQL, because `team_members.user_id` has a foreign key to
   `auth.users`. Everything around it is proven — leadership sees the counseling
   row, a signed-in non-leadership account sees zero — but the role that three
   real people will actually hold has never been exercised.

2. **Decide one thing.** Should an anonymous person be warned, *before* ticking
   "I would like someone to talk to", that they cannot be reached without a
   number? The form says so at the field, but not before the choice. Cheap
   either way; the question is what it does to the person reading it.

3. **Print the poster and the card** and put one up. They are in `design/`,
   published as a design canvas; Export PDF gives both.

### What the session should pick up, in order

1. **Add the `team_members` row** for the new account and finish the boundary
   test above.
2. **Put two or three realistic invented requests in through the form**, not by
   SQL, so the prayer team has something to look at. Do this close to the trial,
   not before — the rows have to be cleared again afterwards, and only Vincent
   can clear them.
3. **The test run** with 2–3 prayer team members, per `ROADMAP.md`.

### State of play, one line each

- Migrations 0001–0010: all applied and verified against the live database.
- `npm run verify`: 10 checks, all passing.
- `npx tsc --noEmit`: clean.
- Live at https://send-a-prayer.vercel.app, public, not announced, no QR printed.
- Both counseling paths, anonymous and named, verified correct in the database.
- Team sign-in on the live site: **works**, confirmed 2026-09-11 by Vincent.
- The database is empty: no submissions, no submitters. One account, leadership.
- A prayer team member's view of the product: **never exercised.** No such account exists.

## Handoff ledger

Appended, never rewritten. One row per session. Fill in the outcome of the row
above when you pick a handoff up.

| # | Date | Headline task | Outcome | Evidence |
|---|---|---|---|---|
| 1 | 2026-08-19 | Build the product end to end: identity choice, form, team list, dashboard, leadership counseling view | landed | 30 commits; migrations 0001–0010 written; deployed to Vercel |
| 2 | 2026-09-11 | Apply migration 0010 and clear the deck for the QR code | landed | 0010 was already applied — verified by function signature, columns, view and grants. `npm run verify` extended from 8 to 10 checks, all passing. Both counseling paths verified by rollback test. Test-row delete refused to the agent, handed to Vincent and done. |
| 3 | 2026-09-11 | Write the standing rules down, build the QR material, prove team sign-in | landed | `AGENTS.md` and `CLAUDE.md` written; handoff ledger started; a hook now enforces two of the rules; QR code and A4/A6 print material built and checked pixel-for-pixel against the generator; team sign-in confirmed working on the live site by Vincent. |

## Setup

- Production branch: `main`. Pushing to `main` deploys to Vercel automatically.
- Live: https://send-a-prayer.vercel.app
- Supabase project ref: `fcrsegyrpieibtmaptir` (there is a second, unrelated
  project on the same account — do not touch it).
- Migrations are applied by hand, in order, from `supabase/migrations/`.
- **Dangerous:** deleting rows, Supabase auth and dashboard settings. Vincent
  does these. See `AGENTS.md`.
- **Dangerous:** running `npx next build` while the dev server is running. See
  `AGENTS.md`.

## Closed 2026-09-11 — do not re-test

- **Migration 0010 is applied.** The previous handoff said the live site was
  broken until it was run. It was not. Confirmed: the 11-parameter
  `submit_prayer` signature exists, `submissions` has `contact_phone`,
  `contact_whatsapp` and `contact_pref`, `counseling_for_leadership` exists with
  the `is_named` column, `purge_expired_submissions` clears the contact fields,
  and `anon` holds zero direct table privileges.
- **Migration 0008 is applied.** `cron.job` holds `purge-expired-submissions`,
  schedule `15 3 * * *`, active. The 90-day deletion the app promises does
  happen.
- **`npm run verify` works against the new function signature**, and now covers
  the two things 0010 added: an anonymous counseling request with no phone number
  is refused, and the public key cannot read `counseling_for_leadership`.
- **Both counseling paths behave correctly.** Verified by a rolled-back
  transaction, so no rows were left behind:
  - anonymous, number only, WhatsApp yes, wants a call → stored, shows as
    `is_named = false` with no name
  - named, wants to meet in person → stored, name and phone from the contact
    record
  - an ordinary prayer request with contact details supplied → details
    discarded, as intended
- **The form sends `null`, not `''`, for the names on the anonymous path.**
  Worth knowing because `submit_prayer` treats any non-null name as the named
  path, so empty strings would create a nameless submitter row.
- **The `WALKTHROUGH TEST%` rows and the `Deleteme` submitter are already gone.**
  `submitters` is empty.

## Closed 2026-09-11, second pass — do not re-test

- **The counseling boundary is proven in both directions for leadership.**
  Tested against the live database inside a rolled-back transaction, so no rows
  were left: with an anonymous counseling request carrying a phone number in
  place, the leadership account sees 1 row in `counseling_for_leadership` and a
  signed-in account that is not leadership sees 0. `submissions_for_team` has no
  contact columns at all — the prayer team's view cannot leak a number even if a
  policy were wrong, because the column is not in it. It also exposes
  `first_name` only, never a surname.
- **Team sign-in works on the live site.** Email and password, not a magic link,
  so `signInWithPassword` does not depend on the Site URL setting at all — that
  setting governs magic links, OAuth and password resets. A deliberately wrong
  password returns 400 from Supabase and the app shows "That email and password
  did not match." without leaking the raw error.

## Still outstanding

- Team sign-in on the live site — unproven, waits on the auth URL change.
- The QR code, and print material for it.
- A real test run with prayer team members.
- Whether the prayer team wants several category groups open at once. Only one
  opens at a time today, which suits working through a theme but not comparing.
  Ask them during the test run rather than deciding for them.
- `PROJECT_BRIEF.md` sections 10a–10h are out of order in the file (10a, 10, 10c,
  10d, 10e, 10h, 10f, 10g, 10b). Harmless, but it makes the decision record hard
  to read in sequence.
