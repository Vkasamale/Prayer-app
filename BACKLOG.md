# Backlog

Everything here is deliberately not being built yet, with the reason it's deferred.

## Deferred from prayer app v1

- **Push notifications** — not needed until submission volume justifies alerting the prayer team in real time. Weekly review cadence makes this low priority.
- **Multi-church / multi-tenant support** — this is being built for one church. Generalizing it now is solving a problem that doesn't exist yet.
- **Analytics/reporting on submissions** — no one has asked for this. Adding dashboards before the core loop even works is scope creep.
- **Congregation login/authentication** — the entire point is removing friction. A login wall contradicts the app's purpose. Revisit only if abuse/spam becomes unmanageable with the anonymous-first model.
- **Automated moderation / spam filtering** — the congregation is about 200 people, so junk should amount to a few items a week at most, cheap for the prayer team to delete by hand. A filter's failure mode is hiding a genuine prayer request from the people meant to pray over it, which is worse than scrolling past spam. Build one only if junk actually becomes unmanageable in practice.
- **Dynamic/multiple QR codes per event** — one static code ships in v1. Splitting codes by service or event is a real feature but adds config overhead with no proven need yet.

## Deferred decision — prayer grouping

**The problem.** The prayer meeting is Wednesday evening. If a hundred requests come in and fifty concern provision, praying them one at a time makes the meeting repetitive and long. The team wants them grouped by theme.

**Why it is not simply solved.** A prayer request is usually about more than one thing at once: a person out of work is asking about provision, and dignity, and their marriage, in the same paragraph. Single-category grouping misfiles most real requests. Multi-select on the form shifts the problem rather than fixing it — someone ticks provision, stops there, and the request never surfaces under family.

**The two candidates, neither chosen (2026-08-19):**

- *The submitter picks categories.* Free to compute, nothing leaves the church's own database, no work for the team. But it depends on an upset person accurately labelling their own request, which is the weakest link in the whole idea.
- *Backend AI assigns categories.* Handles multiple themes per request naturally, which is the actual requirement, and stays invisible to the congregation. But it means sending prayer requests — including abuse and self-harm disclosures — to a third-party company, which sits against what the app promises on its front page. A self-hosted model avoids that and costs far more to run.

**What has to be settled before either is built:** whether prayer request text may leave the church's own database at all. That is a leadership decision, not a technical one, and it decides the rest. If the answer is no, the submitter-picked version is the only candidate left.

## Deferred feature — the prayer team entering requests themselves

Vincent, 2026-08-19: the team should be able to add prayer requests of their own,
for people who asked in person or who will never use a phone. The app currently
holds only what the congregation submits through the form, so anything prayed over
on a Wednesday that arrived by conversation is invisible to the counts and to the
grouping.

Deferred rather than dismissed. It needs a decision first about whose consent is
being recorded: a team member typing someone else's disclosure is a different act
from that person typing it themselves, and the name attached is not the name of
anyone who agreed to anything. Worth building, worth thinking about first.

## Related but separate project

- **Discipleship Bible study app** (devotional feed, ACTS/SOAP journaling, emotion-based verse retrieval) — this is a *different app* with a different user, different scope, and no external deadline. It is explicitly not part of the prayer app project. See its own PROJECT_BRIEF.md when that project starts. Do not let features from this idea bleed into the prayer app's scope.
