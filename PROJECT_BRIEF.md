# Prayer App — Project Brief
*For Flood Church*
*Draft v0.1 — last updated 2026-08-19*

> **Status:** Not started. Concept approved by church leadership, no ship date announced publicly. Vincent building solo with Claude Code.
>
> **Locked decisions** — do not reopen without saying so explicitly:
> - **Anonymous means anonymous.** If a submitter picks the anonymous path, the app holds no identifying data about them at all: no name, no phone, no IP logging, no device fingerprinting, no login, ever. Confirmed by Vincent 2026-08-19. The distinct-submitter count is a floor, and that trade is accepted deliberately — an undercount is the correct price for a congregation member's safety and privacy.
> - Tech stack: PWA (web app, installable from browser). QR scan opens the web app directly, no app store submission.
> - Hosting and services (decided 2026-08-19): GitHub for the repo, Vercel for hosting, Supabase for database and team authentication. All on Vincent's existing accounts.
> - Primary user: church congregation members submitting prayer requests, anonymously or named.
> - Secondary user: prayer team, reviewing submissions on a set day and praying through them together.
> - Money model: none. No payments, no donations in v1.
> - Geography/locale: Flood Church only, single congregation of roughly 200 people, no multi-tenant requirement in v1.
> - Builder: Vincent solo, paired with Claude Code. No other developer.

## 1. One-line pitch
An anonymous prayer request tool for the church, reached by scanning a QR code, so people who won't approach the prayer team in person still get prayed for.

## 2. Problem
People at the back of the church, where the prayer team stands, often don't come up for prayer. Some lack the confidence, some are ashamed to be seen needing prayer, some just don't want the in-person exposure. Right now the only way to get prayed for is to physically walk up. That filters out most of the people who need it most.

## 3. Target users
- **Primary:** any congregation member (or visitor) who wants to submit a prayer request without a face-to-face interaction. Wins on conflict, since the entire point of the app is removing their friction.
- **Secondary:** the prayer team, who need to see submissions clearly enough to actually pray with intention, not just skim a list.

## 4. Scope at launch
- QR code posted in the church, scanning opens the PWA in browser (installable, not App Store)
- Submit a prayer request, anonymous or named, free text
- Prayer team views submissions on a dedicated prayer day
- Counseling request option (separate from prayer submission, flagged for follow-up contact)
- QR code generation/management for the church to print and place

## 5. Core features (v1, in build order)
1. **Prayer submission form** — free text, anonymous toggle, optional name/contact if not anonymous
2. **Prayer team view** — list of submissions, filterable by date, marked as prayed-over once addressed
3. **Counseling request flag** — a distinct submission type signaling "I want to talk to someone," routed differently than a general prayer request, since it implies follow-up contact is wanted
4. **QR/barcode generation** — one static code is enough for v1, no need for dynamic codes per event yet

**Not now:** authentication for congregation members (submission stays anonymous-by-default, no login wall), multi-church support, prayer analytics/reporting, push notifications.

## 6. Money
None. No pricing, no fees, no payment processing anywhere in this app.

## 7. Trust & safety
This is the part that matters most and is currently underspecified — see Open Decisions. Anonymous submissions containing sensitive personal disclosures (abuse, self-harm, crisis) need a clear escalation path to a real human, fast. This is not a feature to build casually; get this wrong and someone in crisis gets a delayed response instead of help.

## 8. Positioning
"Scan, share what's on your heart, and know the prayer team is praying for you, whether you say your name or not."

## 9. Success metrics
- Early: at least one real submission from someone who would not have walked up in person
- Later: consistent weekly submissions, prayer team actually reviewing and following up on the dedicated day (not letting the list pile up unread)

## 10a. Decided (2026-08-19, Vincent)

**Identity choice is the first screen.** Before the prayer form, before anything, the user picks one of two paths:
- **Named** — first name, last name, phone number. Nothing else. No email, no address, no account.
- **Anonymous** — no fields, no prompt, stays anonymous permanently. An anonymous submission is never linked back to a person, not by the prayer team and not by the app.

**Distinct-submitter counting.** The prayer team needs to know how many *different people* submitted, not just how many submissions. This holds for anonymous submitters too: "100 different people sent anonymous requests" is the number we want, and it must be reachable without knowing who any of them are.

The mechanism: on first visit the app generates a random ID and stores it in the browser (localStorage). Every submission carries that ID. It identifies a browser, not a person, and carries no name, no phone, no IP, no fingerprint. It gives repeat-submission counts and distinct-people counts without ever identifying anyone.

Known ceiling, accepted for v1: someone clearing their browser data, switching devices, or using private browsing counts as a new person. The number is therefore a floor on distinct submitters, never an exact headcount. Any attempt to do better (device fingerprinting, IP grouping) is deliberately rejected — it identifies people, which is the one thing the anonymous path promises not to do.

**Prayer team dashboard.** A general tracking view, not analytics on individuals:
- total submissions
- distinct submitters (named and anonymous, as separate counts)
- how many submissions still unprayed-over
- repeat-submission visibility: a named person's requests group under their name; an anonymous person's requests group under their opaque ID with no identity attached

**Note on the data-handling policy.** `ROADMAP.md` currently says "no analytics tracking on submitters." The distinct-submitter count is a deliberate, narrow exception: counts for the prayer team's own workload, never behavioural tracking, never third-party analytics. The policy line in ROADMAP.md has been updated to say exactly this.

## 10. Open decisions
- **Crisis/safety escalation:** what happens if someone submits something indicating they're in danger (self-harm, abuse, suicidal ideation)? Anonymous submissions can't be traced back to offer direct help. This needs a decided protocol before launch, not after. Flagging this as the single highest-priority open decision in the whole project.
- **Counseling request contact method:** partly settled — a named submitter gives a phone number, so the prayer team calls. Still open: an anonymous submitter cannot request counseling and be reached. Decide whether the counseling option is simply unavailable on the anonymous path, or whether it offers a one-way "here's how to reach us" instead.
- **Multiple QR codes:** one code for the whole church, or different codes for different services/events? Locked as "one static code" for v1 but worth revisiting once it's live.

## 10c. Moderation — decided 2026-08-19

Raw feed. The prayer team sees every submission as written, with no filter in front of it. Junk gets deleted by hand from the prayer team view, so that view needs a delete action.

Reasoning: the congregation is roughly 200 people, and only some fraction of those will ever submit. At that scale junk is a handful of items a week at worst, and deleting them by hand costs the team seconds. A filter is code that has to be built, tuned, and maintained, and its failure mode is hiding a real prayer request from the people meant to pray over it. That is a worse outcome than the team scrolling past spam.

Revisit only if junk actually becomes unmanageable in practice. Deferred entry recorded in BACKLOG.md.

## 10d. Data retention and access — decided 2026-08-19

**Prayer request text.** Deleted 90 days after the prayer team marks it prayed-over. A prayer request is not a record to keep: someone disclosed something painful, and the app should not hold it forever. A shrinking list is also easier for the team to work than one that grows without end.

*Assumption pending confirmation:* anonymous submissions are deleted on a shorter 30-day clock, since there is no person attached and no follow-up value once the request has been prayed over. Vincent set 90 days explicitly for named submitters and did not specify anonymous. If one uniform rule is preferred, make both 90.

**Named submitters' contact details.** Name and phone number are kept indefinitely, as a church contact database for ongoing pastoral follow-up. Deleting a prayer request does not delete the person's contact record.

**Removal on request.** Anyone can ask to be removed from the platform at any time, and the church deletes their contact record. No self-service feature in v1 — the person contacts the church and someone removes them. The named path must state plainly, in one sentence on the form, that the church keeps their details and that they can ask to be removed whenever they want. Someone giving a phone number to be prayed for should not discover later that they are in a permanent database.

**Access control.** The contact database is restricted to church leadership. It is not visible to the whole prayer team, and not to the congregation.

This means the team-side login carries two roles:
- *Prayer team* — sees prayer requests and can mark them prayed-over or delete junk. Sees that a request came from a named person, but not their phone number.
- *Leadership* — everything above, plus the contact database and phone numbers.

Note that this is the only login in the app. Congregation members never log in; that remains locked.

**Counts survive deletion.** Removing request text or a contact record never changes the dashboard totals. "100 people submitted" stays true after the words are gone.

## 10e. Church membership question — decided 2026-08-19

One optional question, shown on both paths right after the identity choice:

> Are you part of Flood Church? — Yes / No / Prefer not to say

It does not break anonymity. Among roughly 200 people, membership is a single bit that narrows nobody down.

Optional on purpose. Requiring it on the anonymous path would add a hurdle to the one route built specifically to remove hurdles, and the person who will not answer it is often exactly the person the app exists for. "Prefer not to say" is a real answer, counted as its own category rather than folded into "no."

Self-declared and unverifiable — anyone can tick any box. Verifying membership would require a congregation login, which is locked out, and it is not worth reopening for this. The number is a rough sense of reach, not an audited figure: enough to show whether the QR code is drawing the church's own congregation or spreading beyond it.

Dashboard gains a breakdown: members / not members / did not say.

## 10b. Crisis escalation protocol — decided 2026-08-19

Anonymity is locked, so an anonymous submitter cannot be traced or contacted. Escalation therefore never means "we reach them." It can only mean "they can reach help themselves, immediately, without waiting on the prayer team." Everything below follows from that.

**1. Crisis contact is static and always visible.** Shown on the identity choice screen and on the submission form itself, before anyone types. Not triggered by anything, not conditional on the app detecting anything. A person in crisis sees it whether or not they submit.

**2. Honest latency notice, same placement.** The prayer team reviews on the dedicated prayer day. The screen must say plainly that submissions are not monitored in real time, and give the number to call if the person is in danger right now. This is the most important line in the app: without it, someone in crisis submits and then waits for a response that is days away.

**3. Contact repeats on the confirmation screen** shown after submitting, when the person may still be in distress.

**4. Prayer team gets a manual urgent flag.** A team member reading a submission can mark it urgent. Named submitter: the church calls the phone number given. Anonymous submitter: nothing can be done but pray, which is precisely why points 1-3 carry the weight.

**Which number is shown — revised 2026-08-19.** None. The church has no crisis line and nobody is on call, so the app lists no phone number rather than promising a phone nobody answers.

What carries the weight instead is the honesty: every screen states plainly that nobody is reading the page, so a person in crisis does not sit waiting for a reply that is not coming.

**There is no fixed prayer day.** Requests are prayed over when the prayer team next meets, and the copy says exactly that rather than implying a schedule the church does not keep. Submission timestamps give the team the timing detail they need.

*Open, raised and not resolved:* the national emergency number. Every country has one, it costs the church nothing, needs nobody on call, and makes no promise the church has to keep — but it gives a person in danger somewhere to go. Blocked only on knowing which country the church is in; EMERGENCY_NUMBER in lib/church.ts is null until then, and every screen hides the line rather than showing a guess.

**Deliberately rejected:**
- *Keyword or AI detection of crisis text* — fails both ways. It misses real crises phrased obliquely, since people in crisis rarely use the obvious words, and it creates false confidence that the app is watching. Static contact shown to everyone covers the same ground and cannot silently fail.
- *Disabling the anonymous option when text looks like a crisis* — breaks the locked anonymity promise and drives away precisely the person the app exists for. Someone ashamed to walk up front will not accept being forced to identify themselves at their worst moment.

## 11. Next steps
1. Decide the crisis escalation protocol (Open Decision #1) before writing any submission-form code
2. Sketch the prayer team's review screen, since that's the workflow that actually has to work under time pressure on the dedicated prayer day
3. Confirm with church leadership: anonymous-by-default, or anonymous-as-a-toggle
4. Build submission form first, prayer team view second, counseling flag third, QR generation last (it's the easiest piece and shouldn't gate the rest)
5. Test the full loop once with 2-3 real prayer team members before wider rollout
