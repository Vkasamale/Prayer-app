# Roadmap — Prayer App
*For Flood Church*

## Where we are
Concept approved by church leadership. No code written. No repo, no hosting, no accounts set up. Documentation phase only: `PROJECT_BRIEF.md`, `NEXT_SESSION.md`, `BACKLOG.md` exist. This file is the fourth.

## Standing policies

**Versioning:** `v1.0.0` reserved for the day it's actually in front of the congregation via the QR code. Everything before that stays in `0.x`. Bump the minor version on every feature that ships (submission form, prayer team view, counseling flag, QR generation).

**Branching:** solo build, Vincent + Claude Code. Main branch stays deployable. Feature work happens on short-lived branches, merge when working, no long-running side branches.

**Deploys:** Vincent does all deploys. Nothing goes live to the QR code's real URL without Vincent personally verifying it first, per PART 4.8 of the framework, anything the congregation touches directly is a founder-only action.

**Data handling:** the user picks named or anonymous on the first screen. Nothing gets logged or stored beyond what the prayer team needs to see and pray over. No behavioural analytics and no third-party analytics on submitters. The one counting exception, decided 2026-08-19: an opaque browser-local ID rides along with each submission so the prayer team can count distinct submitters and spot repeat requests. It carries no name, phone, IP, or fingerprint, and an anonymous submission is never linked back to a person. See PROJECT_BRIEF.md section 10a.

## Stack
GitHub (repo), Vercel (hosting), Supabase (Postgres + auth for the team login). Decided 2026-08-19, on Vincent's existing accounts.

**Security requirement, not optional:** the congregation submits without logging in, so the public client writes to Supabase through the anonymous key. Row-level security must allow insert only. If public read is ever left open on the submissions table, every prayer request in the church becomes readable by anyone with the URL. This gets verified before anything goes near the QR code.

## Phase 0 — Decisions before code (complete)
- [x] Crisis escalation protocol decided — no phone number listed, since the church has no crisis line and nobody on call. Every screen states plainly that nobody is reading the page. See PROJECT_BRIEF.md section 10b. Outstanding: the country, so the national emergency number can be shown.
- [x] Moderation approach decided — raw feed to the prayer team, manual delete for junk, no filter. See PROJECT_BRIEF.md section 10c.
- [x] Identity choice decided — named (first name, last name, phone) or anonymous, chosen on the first screen
- [x] Distinct-submitter counting decided — opaque browser-local ID, counts only
- [~] Counseling contact method — phone for named submitters; anonymous-path counseling still open
- [x] Data retention and access decided — request text deleted 90 days after prayed-over, contact details kept indefinitely, leadership-only access, removal on request. See PROJECT_BRIEF.md section 10d.

## Phase 1 — Core loop (current phase)
- [x] Repo on GitHub, Supabase project, and Vercel deployment (live at prayer-app-vkasamales-projects.vercel.app, Vercel Authentication turned off 2026-08-19 so the congregation can reach it)
- [x] Supabase schema + row-level security policies (public client has no table access at all; writes go through submit_prayer)
- [x] Latency notice on identity screen, form, and confirmation screen
- [x] Identity choice screen (named vs anonymous), shown before the form
- [x] Optional "Are you part of Flood Church?" question (Yes / No / Prefer not to say), both paths
- [x] Prayer submission form (free text, plus name/phone when the named path was chosen)
- [x] Prayer team view (list, mark as prayed-over, flag urgent, delete junk)
- [x] Team-side login (roles enforced in the database; leadership-only contact view not built yet)
- [ ] Prayer team dashboard (total submissions, distinct submitters named vs anonymous, unprayed-over count, repeat grouping, membership breakdown)
- [ ] One real test run with 2-3 prayer team members before anything is public

## Before the QR code goes anywhere
- [ ] Schedule purge_expired_submissions — the 90-day retention policy does nothing until something calls it
- [ ] A custom domain: a QR code pointing at a vercel.app address is not a link anyone would trust
- [ ] Leadership view for contact details, so counseling requests can actually be followed up
- [ ] National emergency number in lib/church.ts, once the country is confirmed
- [ ] Real test run with 2-3 prayer team members

## Phase 2 — Extended features
- [ ] Counseling request flag, distinct from general prayer submission
- [ ] QR code generation (single static code)
- [ ] Print-ready QR placement material for the church

## Phase 3 — Public rollout
- [ ] QR code physically placed in church
- [ ] Leadership announcement (only after Phase 1 and 2 are tested, not before)
- [ ] Monitor first real week of submissions closely, adjust based on what actually comes in

## Explicitly not on this roadmap
Push notifications, multi-church support, analytics, congregation login, dynamic QR codes, and the entire discipleship Bible study app. See `BACKLOG.md` for why each is deferred.
