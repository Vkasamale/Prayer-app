# Next session

**Read `AGENTS.md` first.** It holds the rules that do not lapse, and most of
them were learned the expensive way.

## Start here: this project moved accounts

Work continues on a second Claude Pro account. Nothing about the project itself
moved — same repository, same Supabase project, same Vercel deployment — but the
new session starts with no memory of the last one, so this file and `AGENTS.md`
are the whole handover.

**The first thing to do is push.** Six commits sit on `main` unpushed, and the
two migrations they describe are *already applied to the live database*. That is
the safe order — the database ahead of the code, never behind — but it is a
half-finished state and should not be left sitting.

Then confirm the deployment came up with `npm run verify`: eleven checks, all of
which passed when this session closed.

## Setting up the new account

Do this before any work. Most of it is one-time. If the new account is being used
on **the same machine**, items 3 to 7 are already in place and only need
checking; on a fresh machine or a fresh clone, all of them are needed.

### 1. Connect Supabase — required

The agent reads the schema, checks grants and applies migrations through the
Supabase connector. Without it almost everything below is blocked, and the agent
can only guess about the database — which is how the last session's security
defect survived as long as it did.

Connect it in the claude.ai connector settings for that account. A session cannot
authorise a connector for itself, so this is a human step. The project is
`fcrsegyrpieibtmaptir`; a second, unrelated project shares the account, so match
the reference rather than picking the first one listed.

**Tell the new session which connectors are live.** If Supabase is missing it
should say so and stop, not carry on reasoning about a database it cannot see.

### 2. Connect Vercel — optional

Useful for reading deployment logs. Not required: pushing to `main` deploys by
itself, and the site can be checked by loading it.

### 3. Dashboard and repository access, in Vincent's own name

None of these belong to the Claude account, and all three are needed:

- **Supabase dashboard** — for creating team accounts and deleting rows, which
  are Vincent's alone.
- **GitHub**, push rights to `Vkasamale/Prayer-app`.
- **Vercel**, the project that deploys `send-a-prayer.vercel.app`.

### 4. `.env.local` — not in git, and the app will not run without it

It is gitignored, so it does not travel with a clone. `.env.example` shows the
shape. Two variables:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Both come from the Supabase dashboard → Project Settings → API. The anon key is
the one that ships in the browser and can do exactly one thing, so it is not a
secret in the usual sense — but put it in the file, never in a chat.

`scripts/verify-supabase.mjs` reads this file directly, because it runs outside
Next.js.

### 5. `npm install`, and Node

Built and run on Node v24. Run `npm install` after any fresh clone.

### 6. The hooks travel, but may need approving

`.claude/settings.json` and `.claude/hooks/guard-bash.mjs` are in the repository,
so they arrive with it. A new account may still need to approve hook execution
before they run. They are worth having: they refuse `npx next build` while the
dev server is running, and refuse a push carrying a migration that cannot be
confirmed as applied. Both rules exist because both failures happened.

Confirm they are live early, on something harmless, rather than finding out they
are inert at the moment one would have saved you.

### 7. Git identity

Commits are attributed to `Vincent <vinnykasa@gmail.com>`, set per-repository in
`.git/config`. That file does not travel with a fresh clone, and a machine with
no global identity refuses to commit at all until it is set again. The Claude
account's own email is unrelated and should not be used here.

### First session checklist

- [ ] Supabase connector authorised, correct project
- [ ] `.env.local` present, both variables
- [ ] `npm install` done
- [ ] Hooks approved and confirmed firing
- [ ] Git identity set
- [ ] Push the waiting commits
- [ ] `npm run verify` — expect 11 passing

## THE AGENDA

### What Vincent needs to do, shortest first

1. **Create one ordinary prayer team account.** Supabase dashboard →
   Authentication → Users → Add user. Role `prayer_team`, **not** leadership.
   Give the agent the email and it will add the `team_members` row.

   This gates everything else, and it matters more after what was found on
   2026-09-11: the prayer team could read counseling phone numbers straight off
   the `submissions` table, past the leadership-only view. Migration 0011 fixes
   it and the fix is proven at the database level — but it has never been
   exercised by a real signed-in `prayer_team` session, and that is the role
   three real people are about to hold.

2. **Delete the test row** left by the last `npm run verify`:

   ```sql
   delete from submissions where body like 'AUTOMATED CHECK%';
   ```

   Every run writes one such row and cannot remove it: the anon key has no table
   privileges, which is the point. Housekeeping that comes with the check, not a
   defect.

3. **Print the poster and the card.** Links under "Where things live".

4. **Four decisions nobody has made.** Under "Open questions".

### What the session should pick up, in order

1. **Finish the prayer team boundary test.** Add the `team_members` row for the
   new account, sign in as that person, and confirm from a real session that
   counseling contact details are refused. Watch it be refused; do not take the
   grant table's word for it.
2. **Put two or three realistic invented requests in through the form**, so the
   team has something to look at. Through the form, never by SQL — the form is
   the path being tested. Close to the trial, not before: the rows have to be
   cleared again afterwards and only Vincent can clear them.
3. **The test run** with 2-3 prayer team members, per `ROADMAP.md`.
4. Only then: the announcement to the congregation.

### State of play, one line each

- Live at https://send-a-prayer.vercel.app — public, not announced, no QR printed.
- Migrations 0001-0012: all applied to the live database and verified.
- `npm run verify`: 11 checks, all passing. `npx tsc --noEmit`: clean.
- Six commits unpushed. The database is ahead of the code, which is the safe way round.
- The database is empty apart from one `AUTOMATED CHECK` row.
- Accounts: one, leadership. **No ordinary `prayer_team` account exists.**
- Team sign-in on the live site: works, confirmed by Vincent 2026-09-11.

## Handoff ledger

Appended, never rewritten. One row per session. Fill in the outcome of the row
above when you pick a handoff up.

| # | Date | Headline task | Outcome | Evidence |
|---|---|---|---|---|
| 1 | 2026-08-19 | Build the product end to end: identity choice, form, team list, dashboard, leadership counseling view | landed | 30 commits; migrations 0001-0010 written; deployed to Vercel |
| 2 | 2026-09-11 | Apply migration 0010 and clear the deck for the QR code | landed | 0010 was already applied — verified by function signature, columns, view and grants. `npm run verify` extended from 8 to 10 checks, all passing. Both counseling paths verified by rollback test. Test-row delete refused to the agent, handed to Vincent and done. |
| 3 | 2026-09-11 | Write the standing rules down, build the QR material, prove team sign-in | landed | `AGENTS.md` and `CLAUDE.md` written; handoff ledger started; a hook now enforces two of the rules; QR code and A4/A6 print material built and checked pixel-for-pixel against the generator; team sign-in confirmed working on the live site by Vincent. |
| 4 | 2026-09-11 | Security audit before the congregation sees it; the list at volume; the monthly trend | landed | Found and fixed a column leak that let any prayer team member read counseling phone numbers (migration 0011). Cut a Wednesday meeting's data use from about 21 downloads to 1. Moved the counts behind a Totals tab and added a 12-month trend (migration 0012). Mocked the list at 100 requests. 11 checks passing. Six commits left unpushed for the next account. |

## Where things live

| Thing | Where |
|---|---|
| Live site | https://send-a-prayer.vercel.app |
| Supabase project | `fcrsegyrpieibtmaptir` (a second, unrelated project shares the account — do not touch it) |
| QR code, as a file | `public/qr/send-a-prayer.svg` |
| Poster (A4) and card (A6), print-ready | https://claude.ai/code/artifact/0a7ecc40-20c6-4bba-aac1-e4405b35c134 — Export PDF gives both |
| The list mocked at 100 requests | https://claude.ai/code/artifact/ea211082-8811-4d2a-b1c1-1c07ea13cf65 |
| Artboard sources | `design/` (print), `design-list/` (the list mockups). The seeded `.html` is a build artifact and is gitignored. |

If those artifact links do not open on the new account, they were published from
the old one. The sources are in the repository and can be published again.

## Setup

- Production branch: `main`. Pushing to `main` deploys to Vercel automatically.
- Migrations are applied by hand, in order, from `supabase/migrations/`.
- **Dangerous, and Vincent's alone:** deleting rows, and Supabase dashboard and
  auth settings. See `AGENTS.md`.
- **Dangerous:** `npx next build` while the dev server is running. A hook refuses
  it, and also refuses a push carrying a migration it cannot confirm is applied.

## Closed — do not re-test

### 2026-09-11, second session

- **The column leak is fixed and verified.** `counseling_for_leadership` is gated
  on `is_leadership()` and that gate works, but it guarded the front door only:
  `submissions` granted `select` to the whole `authenticated` role under a policy
  of `is_team_member()`, which is true for every role. Any prayer team member
  could have read every counseling phone number from the browser console.
  Migration 0011 replaces the blanket grant with column grants excluding
  `contact_phone`, `contact_whatsapp` and `contact_pref`, and narrows `update` to
  `prayed_over_at` and `flagged_urgent`. Verified after applying: leadership
  still sees the counseling row, and selecting `contact_phone` from the table is
  refused with `insufficient_privilege`.
- **The team's data use.** Marking a request prayed over used to re-download the
  whole list. Measured on the running app: 4-5 requests per tick became 1, and
  page load went from 4 to 3.
- **The list at 100 requests is not an endless scroll.** Themes are closed by
  default and exclusive. Measured at phone width: 1,952px closed, about 2.3
  screens. Ungrouped it would be roughly 26 screens, and unticking "Group by what
  it is about" is the only way to reach that.
- **The monthly trend** (`monthly_stats()`, migration 0012) is team-only, checks
  `is_team_member()` inside the function because a policy cannot filter
  aggregates, and counts redacted rows so history does not rewrite itself as it
  ages.

### 2026-09-11, first session

- Migrations 0008 and 0010 are applied; the retention cron runs at `15 3 * * *`.
- Team sign-in works. It is email and password, so `signInWithPassword` never
  consulted the Site URL setting — that governs magic links, OAuth and password
  resets, and is set correctly anyway.
- Both counseling paths, anonymous and named, behave correctly.
- The form sends `null`, not `''`, for names on the anonymous path.
- The QR code is exactly what the generator produced — compared pixel by pixel.

## Open questions nobody has answered

1. **Should an anonymous person be warned, before ticking "I would like someone
   to talk to", that they cannot be reached without a number?** The form says so
   at the field, but not before the choice. Cheap either way; the question is
   what it does to the person reading it.
2. **Should `browser_id` be visible to the prayer team?** It is in
   `submissions_for_team` today, which means everything one anonymous person
   sends from one phone is linkable by anyone on the team — not to a name, but to
   each other. Someone who sent three requests over a month can be read as one
   story. The app promises "we will not try to find out"; today that is restraint
   rather than design. Dropping the column from the view would settle it.
3. **Should deleting a request be leadership-only?** Any team member can
   permanently delete any request. It is meant for junk, and there is no undo and
   no record of who did it.
4. **Does the prayer team want several category groups open at once?** Only one
   opens at a time. Ask them during the test run rather than deciding for them.

## Still to build

1. The trial with real prayer team members.
2. Print material actually printed and placed.
3. The announcement, last.

Everything in `ROADMAP.md` Phase 2 that is not listed here is done.
