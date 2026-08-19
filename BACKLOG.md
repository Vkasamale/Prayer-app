# Backlog

Everything here is deliberately not being built yet, with the reason it's deferred.

## Deferred from prayer app v1

- **Push notifications** — not needed until submission volume justifies alerting the prayer team in real time. Weekly review cadence makes this low priority.
- **Multi-church / multi-tenant support** — this is being built for one church. Generalizing it now is solving a problem that doesn't exist yet.
- **Analytics/reporting on submissions** — no one has asked for this. Adding dashboards before the core loop even works is scope creep.
- **Congregation login/authentication** — the entire point is removing friction. A login wall contradicts the app's purpose. Revisit only if abuse/spam becomes unmanageable with the anonymous-first model.
- **Automated moderation / spam filtering** — the congregation is about 200 people, so junk should amount to a few items a week at most, cheap for the prayer team to delete by hand. A filter's failure mode is hiding a genuine prayer request from the people meant to pray over it, which is worse than scrolling past spam. Build one only if junk actually becomes unmanageable in practice.
- **Dynamic/multiple QR codes per event** — one static code ships in v1. Splitting codes by service or event is a real feature but adds config overhead with no proven need yet.

## Related but separate project

- **Discipleship Bible study app** (devotional feed, ACTS/SOAP journaling, emotion-based verse retrieval) — this is a *different app* with a different user, different scope, and no external deadline. It is explicitly not part of the prayer app project. See its own PROJECT_BRIEF.md when that project starts. Do not let features from this idea bleed into the prayer app's scope.
