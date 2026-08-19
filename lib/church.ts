// Details specific to Flood Church, kept in one place so nobody has to hunt
// through components to correct them.

export const CHURCH_NAME = 'Flood Church'

// TODO — Vincent supplies this on 2026-08-20. Placeholder ships nowhere near
// the QR code: a wrong number on a crisis notice is worse than no number.
export const CRISIS_CONTACT = {
  label: 'the church',
  phone: '000 000 0000',
  // Also outstanding: confirm whether this phone is answered outside service
  // hours. If it is not, ANSWERED_HOURS must say so plainly. Implying someone is
  // always there, when nobody is, leaves a person in crisis waiting on silence.
  answeredHours: 'checked during the week',
} as const

// TODO — the prayer team's review day has never actually been chosen. The
// latency notice is only honest once it names the real one.
export const PRAYER_DAY = 'the prayer team’s set day'
