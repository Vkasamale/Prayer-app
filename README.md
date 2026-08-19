# Prayer App — Flood Church

An anonymous prayer request tool for Flood Church, reached by scanning a QR code
posted in the building. People who will not walk up to the prayer team in person
can still be prayed for.

## Status

Phase 1. All Phase 0 decisions are closed; no application code written yet.

## Documentation

- [PROJECT_BRIEF.md](PROJECT_BRIEF.md) — scope, locked decisions, and the full
  reasoning behind each decision made so far
- [ROADMAP.md](ROADMAP.md) — phases, standing policies, and the stack
- [NEXT_SESSION.md](NEXT_SESSION.md) — what to pick up next
- [BACKLOG.md](BACKLOG.md) — what is deliberately not being built, and why

## Stack

PWA hosted on Vercel, with Supabase for the database and prayer team
authentication. No app store submission; the QR code opens the web app directly.

## The two rules this app is built around

**Anonymous means anonymous.** If a submitter chooses the anonymous path, the
app holds no identifying data about them: no name, no phone number, no IP
logging, no device fingerprinting, no login. This is not negotiable, and the
undercount it causes in the submitter statistics is an accepted cost.

**A person in crisis must never be left waiting on the prayer team.** Submissions
are reviewed on a set day, not in real time. Crisis contact details and a plain
statement of that delay are shown before anyone types a word.
