// Checks what an ordinary prayer team member can reach, from a real signed-in
// session.
//
//   node scripts/verify-team-boundary.mjs
//
// Migration 0011 exists because the prayer team could read counseling phone
// numbers straight off the submissions table, past the leadership-only view.
// The grant table has been read and says the hole is closed. This signs in as a
// real prayer_team member and tries to walk through it anyway, because a grant
// read in isolation is what let the hole survive in the first place.
//
// Needs two extra lines in .env.local, for an account with role prayer_team:
//
//   TEAM_EMAIL=...
//   TEAM_PASSWORD=...
//
// Reads only. Writes nothing, deletes nothing.

import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

// Read .env.local directly: this runs outside Next.js, which is what normally
// loads it.
const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter((line) => line.includes('=') && !line.trimStart().startsWith('#'))
    .map((line) => {
      const at = line.indexOf('=')
      return [line.slice(0, at).trim(), line.slice(at + 1).trim()]
    }),
)

for (const key of ['TEAM_EMAIL', 'TEAM_PASSWORD']) {
  if (!env[key]) {
    console.error(`${key} is missing from .env.local. See the comment at the top of this file.`)
    process.exit(2)
  }
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

const failures = []

function check(name, passed, detail) {
  console.log((passed ? 'PASS  ' : 'FAIL  ') + name + (detail ? ' — ' + detail : ''))
  if (!passed) failures.push(name)
}

const signedIn = await supabase.auth.signInWithPassword({
  email: env.TEAM_EMAIL,
  password: env.TEAM_PASSWORD,
})
if (signedIn.error) {
  console.error('Could not sign in as ' + env.TEAM_EMAIL + ': ' + signedIn.error.message)
  process.exit(2)
}

// The account under test must be prayer_team. Run this against a leadership
// account and every refusal below would be a real failure reported as a pass.
const role = await supabase.from('team_members').select('role').eq('user_id', signedIn.data.user.id)
const actualRole = role.data?.[0]?.role
if (actualRole !== 'prayer_team') {
  console.error(`${env.TEAM_EMAIL} has role ${actualRole ?? 'none'}, not prayer_team. Nothing proven.`)
  process.exit(2)
}
check('signed in as a prayer_team member', true, env.TEAM_EMAIL)

// What the team is supposed to be able to do.
const list = await supabase.from('submissions_for_team').select('id, body, kind').limit(5)
check('can read the team list', !list.error, list.error?.message)

const trend = await supabase.rpc('monthly_stats', { p_months: 12 })
check('can read the monthly trend', !trend.error, trend.error?.message)

// Postgres reports a refused column as "permission denied for table
// submissions" — the same words it uses for a table nobody may touch at all. So
// the refusals below only mean something if a granted column still reads: that
// is what makes them column-specific rather than the whole table being shut.
// Without this, a migration that revoked everything would leave the three
// checks below passing while the team list quietly broke.
const grantedColumn = await supabase.from('submissions').select('body').limit(1)
check(
  'a granted column on submissions still reads',
  !grantedColumn.error,
  grantedColumn.error
    ? grantedColumn.error.message + ' — the refusals below prove nothing'
    : undefined,
)

// What it must not. A refusal here is the whole point: insufficient_privilege
// from the column grant, not an empty result. An empty result would mean the
// read succeeded and there simply was no data, which proves nothing.
for (const column of ['contact_phone', 'contact_whatsapp', 'contact_pref']) {
  const attempt = await supabase.from('submissions').select(column).limit(1)
  check(
    `${column} refused on the submissions table`,
    Boolean(attempt.error),
    attempt.error ? attempt.error.message : 'THE READ SUCCEEDED — this is the 0011 leak, reopened',
  )
}

// The named path does not use submissions.contact_phone at all: the number is
// on submitters.phone, and 0011 never touched that table. The column grants say
// authenticated may select phone and may update and delete every column there,
// so whether anything stops an ordinary member rests entirely on row-level
// security. Worth asking directly.
const submitterPhone = await supabase.from('submitters').select('phone').limit(1)
check(
  'submitters.phone is out of reach',
  Boolean(submitterPhone.error) || submitterPhone.data?.length === 0,
  submitterPhone.error
    ? submitterPhone.error.message
    : submitterPhone.data?.length
      ? `RETURNED ${submitterPhone.data.length} ROW(S) — the name and number of a real person`
      : 'read allowed, no rows returned',
)

const leadershipView = await supabase.from('counseling_for_leadership').select('*').limit(1)
check(
  'counseling_for_leadership returns nothing',
  Boolean(leadershipView.error) || leadershipView.data?.length === 0,
  leadershipView.error
    ? leadershipView.error.message
    : leadershipView.data?.length
      ? `RETURNED ${leadershipView.data.length} ROW(S) — the leadership gate is open`
      : 'read allowed, no rows returned',
)

// Writes are narrowed to two columns. Editing someone's request is not the
// team's to do.
const edit = await supabase
  .from('submissions')
  .update({ body: 'EDITED BY A TEST' })
  .eq('id', '00000000-0000-4000-8000-000000000000')
check(
  'cannot edit the body of a request',
  Boolean(edit.error),
  edit.error ? edit.error.message : 'update was accepted',
)

await supabase.auth.signOut()

console.log('')
if (failures.length) {
  console.error(`${failures.length} check(s) failed: ${failures.join(', ')}`)
  process.exit(1)
}
console.log('All checks passed. The prayer team cannot reach counseling contact details.')
