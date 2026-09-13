// Details specific to Flood Church, kept in one place so nobody has to hunt
// through components to correct them.

export const CHURCH_NAME = 'Flood Blantyre Church'

// Decided 2026-08-19: the church has no crisis line and nobody is on call, so
// none is listed. Promising a phone nobody answers is worse than promising
// nothing.
//
// What replaces it is honesty about the delay. A person in crisis must never
// sit waiting on this page for a reply that is not coming.
//
// Malawi's national emergency lines, confirmed 2026-08-19. They cost the church
// nothing and need nobody on call.
//
// Reported to be unreliable in practice: coverage varies by area and by mobile
// network. They are shown anyway, because a number that sometimes works beats no
// number at all — but the wording never promises an answer, only tells someone
// where to try.
export const EMERGENCY_CONTACTS: { label: string; phone: string }[] = [
  { label: 'the police', phone: '997' },
  { label: 'an ambulance', phone: '998' },
]

// The prayer meeting is Wednesday evening, and that is when requests are prayed
// over. Naming the day matters: someone deciding whether to wait needs a real
// answer, not a vague one.
export const REVIEW_CADENCE = 'at the Wednesday evening prayer meeting'
