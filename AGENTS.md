# Working on the Prayer App

Read this before doing anything else. It is written for a session with no
memory of any conversation that produced it.

Every rule below names the failure that produced it. The reason matters more
than the rule: it is what lets you apply the rule to the situation nobody wrote
down.

## What this is

A prayer request app for Flood Church. Someone scans a QR code, chooses whether
to give their name, writes a request, and optionally asks to talk to someone.
The prayer team reads the requests; leadership sees only the requests that asked
for a conversation.

The whole product rests on one promise: **anonymous means anonymous.** Every
technical decision defers to that, and the one place it bends — a person who
stayed anonymous leaving a phone number so they can be rung — bends by their own
hand, for one request, and is erased on the 90-day run. See `PROJECT_BRIEF.md`
section 10h.

Live at https://send-a-prayer.vercel.app — public, not announced, no QR code
printed yet.

## Branching and deploys

- `main` is production. Pushing to `main` deploys to Vercel automatically.
- There are no other long-lived branches.
- **Apply a migration to Supabase before pushing code that calls it.** Code
  shipped ahead of its migration took down every submission on the live site,
  not only the new counseling ones, because `submit_prayer` was called with
  parameters the database function did not have.

## Before every push

1. `npx tsc --noEmit` — must be clean.
2. `npm run verify` — the outside-in database contract check. Report the number
   of passing checks, not the word "passing".
3. Update `NEXT_SESSION.md`, and append a row to its handoff ledger.
4. If a rule was learned, write it into this file in the same commit.

**Never run `npx next build` while the dev server is running.** It overwrites
`.next` underneath the running server and the app starts throwing module errors
that look like real bugs. This cost time twice in one session. Use
`npx tsc --noEmit` to check types instead.

## The rules that do not lapse

### Vincent does the dangerous things
Supabase dashboard settings, auth URL configuration, and anything that deletes
rows. An agent may read the database and may apply migrations, but destructive
SQL goes to Vincent with the statement written out ready to run.

### Never claim something works because it compiles
A type-check proves the shapes agree. It proves nothing about the database, the
grants, or what a person sees. "Works" means it was observed: a query run, a
page loaded, a check that passed.

### Never report a task as done from a stale handover
`NEXT_SESSION.md` said the live site was broken until migration 0010 was
applied. It had already been applied. Verify state against the database before
acting on a written claim about it, and before repeating that claim to Vincent.

### Test against the real database, never a mock
The interesting failures in this project are all grants and policies, which a
mock cannot have. To test a write without leaving rows behind, wrap it in a
`do $$ ... $$` block that ends with `raise exception`, which rolls the whole
statement back:

```sql
do $t$ begin
  perform submit_prayer(...);
  -- read back whatever you need, build it into a string
  raise exception 'ROLLBACK-ON-PURPOSE %', out;
end $t$;
```

### Supabase grants new objects in `public` to `anon` by default
Every new table, view or function needs an explicit
`revoke all ... from public, anon, authenticated` followed by the grants you
actually want. Revoking `from public` alone is not enough. This caused four
separate defects in one session. The checks at the bottom of each migration are
what caught them, so keep writing them.

### Row-level security filters rows, never columns
A policy of `is_team_member()` on `submissions` let every prayer team member
read `contact_phone` straight off the table through PostgREST, past the
leadership-gated view. RLS cannot express "not that column". When a table holds
something only some roles may see, grant the columns explicitly — and grant
`update` per column too, or the team can rewrite the words a person wrote. The
leadership view still works because it is `security_invoker = off` and reads
those columns as its owner.

**A view is not a boundary.** If the base table is readable, the view is
decoration. Check the table whenever you check a view.

### Permission mistakes fail as absence, not as errors
A missing grant shows up as an empty list, not an exception. A view that
returns no rows is not evidence that it is empty. `counseling_for_leadership`
correctly returns nothing to a non-leadership role — the same symptom as a
broken view.

### Row-level security policy expressions run as the calling role
So the `authenticated` role needs `execute` on any helper function a policy
calls — `is_leadership()`, for instance.

### Every migration ends in its own verification block
A `do $check$` block after the `commit` that asserts what the migration was
for, and that `anon` still holds no direct table privileges. Write it so a
re-run is safe: drop both the old and the new function signature, guard
`create type` with an existence check.

### Mark deliberate shortcuts in the code
A comment naming the shortcut and the condition that would end it. A simple
thing reads as intent rather than ignorance.

### Two of these rules are enforced by a hook
`.claude/hooks/guard-bash.mjs` runs before every Bash command and refuses a
`next build` while port 3000 is listening, and a `git push` carrying a commit
that adds a migration. It is Node rather than shell because there is no `jq` on
this machine — the first version used it, found nothing, and silently allowed
everything. A hook that cannot fail loudly is worse than no hook, so both refusal
paths were proven before it was wired in.

## Locale and copy

- The church is in Malawi. Timezone Africa/Blantyre. Emergency numbers shown
  on the pages are the Malawi national lines: police 997, ambulance 998.
  Phone numbers are stored as typed, with no format imposed — the database only
  checks the length is between 5 and 32 characters.
- The church is not named to the congregation. See `PROJECT_BRIEF.md` 10f.
- Copy is plain, warm, and never clinical. Nobody reading this app is having a
  good day. No exclamation marks, no product voice, no "Oops!".
- Never show a database error to a person. Their words stay in the box.

## The QR code and the print material

`public/qr/send-a-prayer.svg` is the single static QR code, generated with
`npx qrcode -t svg -e H` at the highest error-correction level so it still scans
once the paper is scuffed or a corner is gone. Vector, so it prints crisply at
any size. Regenerate it only if the address changes.

The poster and card live in `design/` as `.dc.html` artboards and are published
as a design canvas. They are A4 (794x1123) and A6 (397x559) at 96 px per inch.
Three things about them are load-bearing:

- **They are cream, not the app's near-black.** An A4 flood of `#101a1f` drinks
  ink and comes out grey on an ordinary printer.
- **Set `box-sizing: border-box` on any new artboard.** The app sets it
  globally; a `.dc.html` does not inherit that, so padding is added to the fixed
  page height and the artboard silently overflows its frame.
- **The QR modules are strokes, not fills.** The `qrcode` library emits
  `<path stroke="#000000">`; giving that path a `fill` renders a blank white
  square that looks fine until nobody can scan it.

## The stack, and what is unusual about it

- Next.js App Router, React, TypeScript, deployed on Vercel.
- Supabase Postgres. **The browser holds only the anon key, and that key can do
  exactly one thing: call `submit_prayer()`.** It has no table privileges at
  all. Anything that reads goes through an authenticated session and a view.
- Migrations are plain SQL in `supabase/migrations/`, applied by hand in order.
  There is no migration runner, so the files must be idempotent.
- `scripts/verify-supabase.mjs` runs outside Next.js and reads `.env.local`
  itself.

## Where the standing record lives

| File | What it holds |
|---|---|
| `AGENTS.md` | This file. The rules that do not lapse. |
| `PROJECT_BRIEF.md` | Every decision made, with its reasoning, in sections 10a–10h. |
| `ROADMAP.md` | Phases, standing policies, and dated session notes. |
| `BACKLOG.md` | What is deliberately not being built, and why. |
| `NEXT_SESSION.md` | The handoff, and the ledger of what each session actually achieved. |
