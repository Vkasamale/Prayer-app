# Next session

**Read `AGENTS.md` first.** It holds the rules that do not lapse, and most of
them were learned the expensive way.

## Start here

The account move is done and the setup below is working. Two things before any
new work:

1. **`npm run verify`** — twelve checks. The twelfth is new and compares the
   commit the live site was built from against `HEAD`. If it fails, the site is
   running old code, which is a thing that happened and went unnoticed for a
   day.
2. **One commit is unpushed**, `bb76983`, and it is optional. See "The
   deployment problem" before pushing it.

## Setting up

If this is a fresh clone or a new machine, all of it is needed. On the machine
the last session ran on, all of it is already in place.

### 1. Supabase, through the CLI — required

**The claude.ai Supabase connector was authorised and turned out to be scoped to
the wrong organisation:** it listed one unrelated project, `eci-tracker`, and
never showed `fcrsegyrpieibtmaptir` at all. Three rounds were lost to that —
rows were deleted and an account created against a different project, both
apparently succeeding while this database did not change.

What works instead, and what the last session used for everything:

```
npx supabase login            # paste a personal access token at the prompt
npx supabase link --project-ref fcrsegyrpieibtmaptir --yes
npx supabase db query --linked "select count(*) from submissions"
```

`login` stores the token in the Windows credential store, so it is not in the
shell history, not in a file, and not in a transcript. **An agent session on the
same machine shares that login** and can read and write the database directly.

Two things the last session learned the hard way:

- **Check what the connection can see before trusting it.** `npx supabase
  projects list` must show `fcrsegyrpieibtmaptir` / `Prayer-app`, West EU
  (Ireland). A second unrelated project sits in the same account.
- **Never run `supabase db push`.** The migrations are named `0001_…`–`0012_…`,
  not the CLI's timestamp format, so the CLI recognises none of them as applied
  and would re-run all twelve against the live database. Confirmed by reading
  the remote migration history: it holds two rows, not twelve. Migrations are
  applied by hand, in order, as they always have been.

### 2. `.env.local` — not in git, and the app will not run without it

Gitignored, so it does not travel with a clone. `.env.example` shows the shape.

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
TEAM_EMAIL                      # prayerteam@example.com
TEAM_PASSWORD                   # set in the Supabase dashboard
```

The first two come from the Supabase dashboard → Project Settings → API. The
second two are the ordinary prayer team account and are what `npm run
verify:team` signs in as.

`LEAD_EMAIL` and `LEAD_PASSWORD` are **not** there yet and are the one thing
blocking the leadership half of the boundary test. See the agenda.

### 3. `npm install`, and Node

Built and run on Node v24. Run `npm install` after any fresh clone.

### 4. The hooks travel, but may need approving

`.claude/settings.json` and `.claude/hooks/guard-bash.mjs` are in the
repository. A new account may need to approve hook execution before they run.

The push guard **now takes a confirmation**, which it did not before: it refuses
a push adding a migration that `supabase/applied.txt` does not list. Previously
it refused outright, told you to confirm and push again, then refused
identically because it is stateless. It had blocked two legitimate actions
before that was fixed. `npm run test:hook` covers both refusal paths.

### 5. Git identity

Commits are attributed to `Vincent <vinnykasa@gmail.com>`, set per-repository in
`.git/config`. That file does not travel with a fresh clone.

### First session checklist

- [ ] `npx supabase projects list` shows `fcrsegyrpieibtmaptir`
- [ ] `npx supabase link --project-ref fcrsegyrpieibtmaptir`
- [ ] `.env.local` present, four variables
- [ ] `npm install` done
- [ ] `npm run verify` — expect 12 passing
- [ ] `npm run verify:team` — expect 10 passing
- [ ] `npm run test:hook` — expect 5 passing

## The deployment problem

**Vercel refuses to build pushed commits.** It reports that the commit author
does not have contributing access and suggests upgrading to Pro. That advice is
wrong — this is one person, not a collaborator — but the refusal is real, and it
is *why the site served an old build for a day while every check passed*.

What is known: the Vercel scope is the personal Hobby account `vkasamale`, the
project is `prayer-app`, the repository is `Vkasamale/Prayer-app`, the commit
author email is `vinnykasa@gmail.com`, and that email is listed on the GitHub
account. So one of two things is false and neither has been checked:

- the GitHub account connected to Vercel is a **different login** — Vercel →
  Settings (account, not project) → Authentication;
- or the email is listed on GitHub but **not verified**, and unverified emails
  do not attribute commits.

The failed deployment's own detail page names the author it rejected, and that
would end the guessing in one screen.

**None of this blocks shipping.** Deploy from the CLI instead:

```
npx vercel --prod --build-env VERCEL_GIT_COMMIT_SHA=$(git rev-parse HEAD)
```

`--build-env` is not optional. A CLI deploy carries no git metadata, so without
it the build-commit stamp ships as `local` and `npm run verify` fails on a
perfectly good deployment.

`bb76983` (unpushed) adds a GitHub Action that calls a Vercel deploy hook, which
sidesteps author matching entirely. It needs two one-time steps first — create
the hook in Vercel, put its URL in the repository secret `VERCEL_DEPLOY_HOOK` —
and the run goes red until they exist. **It is reasonable to drop this commit**
now that CLI deploys work; keep it only if pushes will come from another
machine.

## THE AGENDA

### What Vincent needs to do, shortest first

1. **Enable leaked password protection.** Supabase dashboard → Authentication →
   Policies. Three real people are about to get password accounts and the
   password is the whole of the sign-in. Flagged by the advisors on 2026-09-13
   and still off.

2. **Put `LEAD_EMAIL` and `LEAD_PASSWORD` in `.env.local`** for the leadership
   account. This unblocks the one untested half of the security model.

3. **Settle the Vercel author question** — one screen, above.

4. **Print the poster and the card.** Links under "Where things live".

5. **Five decisions nobody has made.** Under "Open questions".

### What the session should pick up, in order

1. **Prove leadership can still reach a counseling number.** Everything tested
   so far is refusal: the prayer team cannot see contact details, from a real
   signed-in session, verified. Nothing yet confirms the people who *need* the
   number can still get it. Extend `scripts/verify-team-boundary.mjs` with a
   leadership sign-in once the credentials are in `.env.local`. This is the last
   real hole before the trial.

2. **One migration, two related fixes.**
   - `submitters` is protected by row-level security alone: `authenticated`
     still holds `select`, `update` and `delete` on every column including
     `phone`. `submissions` is protected by the privilege being absent, which is
     much harder to undo by accident. Bring `submitters` to the same footing,
     the way migration 0011 did.
   - `submissions_for_team` can move to `security_invoker = on` and gain table
     RLS as a second line of defence. It selects only columns `authenticated`
     already holds, so unlike the leadership view it does not depend on being
     SECURITY DEFINER.

   Run `npm run verify:team` before and after. Add a line to
   `supabase/applied.txt` **after reading the live database**, or the push guard
   will refuse — which is the point of it.

3. **Bring the prayer team page across to the new design.** It has not been
   looked at since the repaint and holds the most card-like surfaces left. Sign
   in as `prayerteam@example.com`.

4. **Test the QR save on a real phone.** The PNG is produced correctly —
   verified in the running app, 34KB, 32% dark pixels — but whether iOS hands it
   to the photo library through `navigator.share({files})` cannot be tested from
   a desktop browser.

5. **The trial** with 2-3 prayer team members, per `ROADMAP.md`.

6. **Two or three realistic invented requests through the form**, close to the
   trial, so the team has something to look at. Through the form, never by SQL.
   The rows have to be cleared afterwards.

7. Only then: the announcement to the congregation.

### State of play, one line each

- Live at https://send-a-prayer.vercel.app, running `bb76983`, confirmed by
  reading the build-commit stamp off the live page.
- The app now looks like an opened Bible. See "The design" below.
- Migrations 0001-0012 applied and listed in `supabase/applied.txt`.
- `npm run verify`: 12 checks. `npm run verify:team`: 10. `npm run test:hook`: 5.
  `npx tsc --noEmit`: clean.
- The database is empty. No test rows outstanding.
- Accounts: `vkasamale@gmail.com` (leadership), `prayerteam@example.com`
  (prayer_team, created 2026-09-13).
- **Every push needs a manual deploy** until the Vercel question is settled.

## The design, and what it costs

The app is set as an opened Bible: cream paper, ink, a spine down the left where
the paper darkens into the gutter, the gilt edge of the block down the right,
hairline rules, and Petrona alone across display and body — one family, the way
a Bible is set.

Two rules in it are deliberate and should survive future edits:

- **Red is the red-letter convention, not an accent colour.** Matthew 11:28 on
  the first screen is Christ speaking and is set in red. 1 Peter 5:7 on the
  confirmation screen is Peter, so it is ink italic. Which voice gets the colour
  is the rule, and it keeps red to at most once on a page.
- **Nothing is a card.** The identity choices are numbered entries ruled off
  from each other, sitting directly on the paper. The crisis notice is a
  preface, italic between two rules. Every corner radius is zero. A card is the
  most website-looking object there is.

**What it gives up.** The previous palette was dark, and the reason is written
at the top of `globals.css`: a person at the back of a room should not be lit up
by their own screen. A bright page is conspicuous in a way the old one was not.
That argument now rests entirely on the writing and on the absent church name.
**Ask the testers about this directly** — it is the largest open risk in the
redesign.

**The verses are NIV**, which is copyrighted. Biblica permit up to 500 verses
non-commercially provided their notice appears, and it does, as a colophon at
the foot of the first screen. Two verses is well inside that. If this app ever
takes money, the permission needs looking at again.

## Handoff ledger

Appended, never rewritten. One row per session. Fill in the outcome of the row
above when you pick a handoff up.

| # | Date | Headline task | Outcome | Evidence |
|---|---|---|---|---|
| 1 | 2026-08-19 | Build the product end to end: identity choice, form, team list, dashboard, leadership counseling view | landed | 30 commits; migrations 0001-0010 written; deployed to Vercel |
| 2 | 2026-09-11 | Apply migration 0010 and clear the deck for the QR code | landed | 0010 was already applied — verified by function signature, columns, view and grants. `npm run verify` extended from 8 to 10 checks, all passing. Both counseling paths verified by rollback test. Test-row delete refused to the agent, handed to Vincent and done. |
| 3 | 2026-09-11 | Write the standing rules down, build the QR material, prove team sign-in | landed | `AGENTS.md` and `CLAUDE.md` written; handoff ledger started; a hook now enforces two of the rules; QR code and A4/A6 print material built and checked pixel-for-pixel against the generator; team sign-in confirmed working on the live site by Vincent. |
| 4 | 2026-09-11 | Security audit before the congregation sees it; the list at volume; the monthly trend | landed | Found and fixed a column leak that let any prayer team member read counseling phone numbers (migration 0011). Cut a Wednesday meeting's data use from about 21 downloads to 1. Moved the counts behind a Totals tab and added a 12-month trend (migration 0012). Mocked the list at 100 requests. 11 checks passing. Six commits left unpushed for the next account. |
| 5 | 2026-09-13 | Push the waiting work, prove the prayer team boundary from a real session, redesign the app as a Bible | landed | Six waiting commits pushed. Push guard given a confirmation path it never had (`supabase/applied.txt`) plus a test. Prayer team boundary proven from a real signed-in session against a real counseling request put through the live form — and the exercise found the test was looking at the wrong table, because the named path stores the number on `submitters.phone`, which 0011 never touched. App redesigned as an opened Bible: NIV verses, no cards, QR code shown and saveable on the page. Discovered Vercel had been silently refusing to deploy; added a twelfth check that reads the build's commit off the live site, the only thing in the repo that would have caught it. Supabase advisors triaged. Database left empty. |

## Where things live

| Thing | Where |
|---|---|
| Live site | https://send-a-prayer.vercel.app |
| Supabase project | `fcrsegyrpieibtmaptir` (a second, unrelated project shares the account — do not touch it) |
| QR code, as a file | `public/qr/send-a-prayer.svg` |
| QR code, on the page | "Show the QR code", first screen and after sending |
| Poster (A4) and card (A6), print-ready | https://claude.ai/code/artifact/0a7ecc40-20c6-4bba-aac1-e4405b35c134 — Export PDF gives both |
| The list mocked at 100 requests | https://claude.ai/code/artifact/ea211082-8811-4d2a-b1c1-1c07ea13cf65 |
| Artboard sources | `design/` (print), `design-list/` (the list mockups). The seeded `.html` is a build artifact and is gitignored. |

If those artifact links do not open, they were published from an older account.
The sources are in the repository and can be published again.

## Setup

- Production branch: `main`. **Pushing no longer deploys** — see "The deployment
  problem".
- Migrations are applied by hand, in order, from `supabase/migrations/`, then
  recorded in `supabase/applied.txt` after being read back from the live
  database.
- **Dangerous, and Vincent's alone:** deleting rows, and Supabase dashboard and
  auth settings. See `AGENTS.md`. The last session was granted this three times,
  each time for named row ids, each time as a one-off. The rule is unchanged.
- **Dangerous:** `npx next build` while the dev server is running, and
  `supabase db push` ever.

## Closed — do not re-test

### 2026-09-13

- **The prayer team cannot reach counseling contact details.** Proven from a
  real signed-in `prayer_team` session against a real counseling request put
  through the live form, not from the grant table: `contact_phone`,
  `contact_whatsapp` and `contact_pref` each refused, `submitters.phone` empty,
  the leadership view empty, editing a body refused. A granted column is read in
  the same session to prove the refusals are column-specific rather than the
  whole table being shut.
- **The Supabase advisors were triaged.** Both SECURITY DEFINER views and all
  seven SECURITY DEFINER functions are intended.
  `counseling_for_leadership` **must** be definer: it selects the three columns
  0011 revoked, and `is_leadership()` in its `WHERE` is the gate — which makes
  that one line a single point of failure, covered by `verify:team`.
  `dashboard_stats` and `monthly_stats` both gate internally on
  `is_team_member()`, checked. `rls_auto_enable` is a Supabase platform event
  trigger and is not callable as RPC despite the advisor's wording.
- **The live site is verifiable.** Vercel stamps the commit into a
  `build-commit` meta tag and `npm run verify` compares it to `HEAD`. A sha
  rather than a marker string, so nothing needs keeping in sync.
- **The QR code rasteriser works**: 1024px PNG, 34KB, 32% dark pixels, drawn
  from the SVG in the browser with smoothing off.

### 2026-09-11, second session

- **The column leak is fixed and verified.** Migration 0011 replaces the blanket
  grant on `submissions` with column grants excluding `contact_phone`,
  `contact_whatsapp` and `contact_pref`, and narrows `update` to
  `prayed_over_at` and `flagged_urgent`.
- **The team's data use.** Marking a request prayed over used to re-download the
  whole list: 4-5 requests per tick became 1, page load 4 to 3.
- **The list at 100 requests is not an endless scroll.** 1,952px closed at phone
  width, about 2.3 screens.
- **The monthly trend** (`monthly_stats()`, migration 0012) is team-only and
  counts redacted rows so history does not rewrite itself as it ages.

### 2026-09-11, first session

- Migrations 0008 and 0010 are applied; the retention cron runs at `15 3 * * *`.
- Team sign-in works. It is email and password, so `signInWithPassword` never
  consulted the Site URL setting.
- Both counseling paths, anonymous and named, behave correctly.
- The form sends `null`, not `''`, for names on the anonymous path.
- The QR code is exactly what the generator produced — compared pixel by pixel.

## Open questions nobody has answered

1. **Does the bright page cost the discretion the dark one bought?** New on
   2026-09-13 and the most important of these. Ask the testers whether they
   would open this in a room with people in it.
2. **Should an anonymous person be warned, before ticking "I would like someone
   to talk to", that they cannot be reached without a number?** The form says so
   at the field, but not before the choice.
3. **Should `browser_id` be visible to the prayer team?** It is in
   `submissions_for_team` today, which means everything one anonymous person
   sends from one phone is linkable by anyone on the team — not to a name, but
   to each other. The app promises "we will not try to find out"; today that is
   restraint rather than design. Dropping the column would settle it.
4. **Should deleting a request be leadership-only?** Any team member can
   permanently delete any request. No undo, no record of who did it.
5. **Does the prayer team want several category groups open at once?** Only one
   opens at a time. Ask during the trial rather than deciding for them.

## Still to build

1. The trial with real prayer team members.
2. Print material actually printed and placed.
3. The announcement, last.

Everything in `ROADMAP.md` Phase 2 that is not listed here is done.
