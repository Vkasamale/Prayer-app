# Next session

## THE AGENDA

### What Vincent needs to do, shortest first

1. **Delete the test rows.** Four rows in `submissions`, all labelled. An agent
   is not permitted to run deletes. Paste into the Supabase SQL editor:

   ```sql
   delete from submissions where body like 'AUTOMATED CHECK%';
   ```

   This is the whole table — there is no real data in it yet.

2. **Point Supabase auth at the live address.** Supabase dashboard →
   Authentication → URL Configuration. Set **Site URL** to
   `https://send-a-prayer.vercel.app` and add it to **Redirect URLs**. Team
   sign-in has only ever been tested on localhost, so it is unproven on the
   deployed site until this is done.

3. **Answer one open question.** Should an anonymous person be warned, *before*
   ticking "I would like someone to talk to", that they cannot be reached
   without giving a number? The form says so at the field, but not before the
   choice. Either answer is cheap to build; the question is what it does to the
   person reading it.

### What the session should pick up, in order

1. **Sign in to the team view on the live site** and confirm it works, once
   item 2 above is done. This is the last unproven path in the product.
2. **The QR code** — Phase 2, small, and the last thing before a real trial.
3. **Print-ready QR material** for the church.
4. **A real test run** with 2–3 prayer team members, per `ROADMAP.md`.

### State of play, one line each

- Migrations 0001–0010: all applied and verified against the live database.
- `npm run verify`: 10 checks, all passing.
- `npx tsc --noEmit`: clean.
- Live at https://send-a-prayer.vercel.app, public, not announced, no QR printed.
- Both counseling paths, anonymous and named, verified correct in the database.
- Team sign-in on the live site: **not proven.** Waits on agenda item 2.

## Handoff ledger

Appended, never rewritten. One row per session. Fill in the outcome of the row
above when you pick a handoff up.

| # | Date | Headline task | Outcome | Evidence |
|---|---|---|---|---|
| 1 | 2026-08-19 | Build the product end to end: identity choice, form, team list, dashboard, leadership counseling view | landed | 30 commits; migrations 0001–0010 written; deployed to Vercel |
| 2 | 2026-09-11 | Apply migration 0010 and clear the deck for the QR code | partly landed | 0010 was already applied — verified by function signature, columns, view and grants. `npm run verify` extended from 8 to 10 checks, all passing. Both counseling paths verified by rollback test. Test-row delete refused to the agent, handed to Vincent. |

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
