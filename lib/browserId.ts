// An opaque identifier for this browser, used only to count distinct submitters
// and group repeat requests. It is not a person: no name, phone, IP or
// fingerprint is derived from or attached to it.
//
// It undercounts on purpose. A cleared browser, a second device or a private
// window all read as someone new, and that is the accepted cost of promising
// anonymity — see PROJECT_BRIEF.md section 10a.

const KEY = 'prayer-app.browser-id'

export function getBrowserId(): string {
  const existing = window.localStorage.getItem(KEY)
  if (existing) return existing

  const fresh = crypto.randomUUID()
  window.localStorage.setItem(KEY, fresh)
  return fresh
}
