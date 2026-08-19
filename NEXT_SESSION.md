# Next session

> **Crisis escalation protocol is decided** (2026-08-19). See PROJECT_BRIEF.md section 10b. Outstanding piece: Vincent supplies the church emergency number on 2026-08-20, and confirms whether that phone is answered outside service hours. The submission form is unblocked.

## Setup
- No repo created yet.
- No accounts, hosting, or domains set up yet.
- Stack: PWA, no backend framework chosen yet.

## 0. Do this first
Get the church emergency number from Vincent and confirm whether that phone is answered outside service hours. If it is not, the crisis screen must say so plainly. The crisis protocol itself is settled — PROJECT_BRIEF.md section 10b.

## 1. Moderation — decided
Raw feed, no filter. The prayer team deletes junk by hand, so the team view needs a delete action. See PROJECT_BRIEF.md section 10c.

## 2. Counseling contact method — mostly settled
Named submitters give a phone number, so the prayer team calls. Remaining question: what a counseling request looks like on the anonymous path, where there is nobody to call. Either the option is hidden there, or it shows a one-way "here is how to reach us" instead.

## 3. Build order once above is settled
1. Identity choice screen — named (first name, last name, phone) or anonymous, shown before anything else
2. Optional "Are you part of Flood Church?" question (Yes / No / Prefer not to say), both paths
3. Submission form (free text; name/phone carried over when named)
4. Prayer team view (list, mark as prayed-over, delete junk)
5. Prayer team dashboard (counts: total, distinct submitters, unprayed-over, repeats, membership breakdown)
6. Counseling request flag (distinct from general prayer submission)
7. QR code generation (single static code, lowest priority, do last)

## Closed — do not re-test
(nothing yet, project hasn't started)

## Decided 2026-08-19
- Identity choice is the first screen: named (first name, last name, phone) or anonymous. Anonymous stays anonymous, permanently.
- Distinct submitters are counted via an opaque browser-local ID, which carries no identifying data. See PROJECT_BRIEF.md section 10a.
- The prayer team gets a dashboard of counts, not analytics on individuals.

## Still outstanding
- Church emergency number, and whether it is answered out of hours (see "Do this first")
- Counseling on the anonymous path
- Anonymous retention window: 30 days assumed, 90 also fine — confirm with Vincent
- Country the church is in, for the data-protection question on the indefinite contact database
- Whether one QR code is enough or church wants multiple
