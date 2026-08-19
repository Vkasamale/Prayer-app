// Details specific to Flood Church, kept in one place so nobody has to hunt
// through components to correct them.

export const CHURCH_NAME = 'Flood Church'

// Decided 2026-08-19: the church has no crisis line and nobody is on call, so
// none is listed. Promising a phone nobody answers is worse than promising
// nothing.
//
// What replaces it is honesty about the delay. A person in crisis must never
// sit waiting on this page for a reply that is not coming.
//
// TODO — Vincent to confirm the country, so the national emergency number can
// be shown here. It costs the church nothing, needs nobody on call, and gives a
// person in danger somewhere to go. Left blank rather than guessed: wrong digits
// on a crisis screen are worse than none.
export const EMERGENCY_NUMBER: string | null = null

// The prayer meeting is Wednesday evening, and that is when requests are prayed
// over. Naming the day matters: someone deciding whether to wait needs a real
// answer, not a vague one.
export const REVIEW_CADENCE = 'at the Wednesday evening prayer meeting'
