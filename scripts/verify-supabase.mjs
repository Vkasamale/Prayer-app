// Checks the database contract from the outside, as the public client sees it.
//
//   node scripts/verify-supabase.mjs
//
// Two things are asserted, and the second matters more than the first:
//
//   1. An anonymous submission goes through.
//   2. The anon key cannot read anything back. If this ever passes a read, every
//      prayer request in the church is exposed to anyone holding a key that
//      ships in the browser.
//
// Writes one obviously-labelled test row. Delete it afterwards with:
//   delete from submissions where body like 'AUTOMATED CHECK%';

import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
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

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
)

const failures = []

function check(name, passed, detail) {
  console.log((passed ? 'PASS  ' : 'FAIL  ') + name + (detail ? ' — ' + detail : ''))
  if (!passed) failures.push(name)
}

// 1. An anonymous submission is accepted.
const submitted = await supabase.rpc('submit_prayer', {
  p_body: 'AUTOMATED CHECK - safe to delete',
  p_browser_id: '00000000-0000-4000-8000-000000000001',
  p_kind: 'prayer',
  p_is_member: null,
  p_categories: ['provision', 'family'],
  p_first_name: null,
  p_last_name: null,
  p_phone: null,
})
check('anonymous submission accepted', !submitted.error, submitted.error?.message)

// Categories are an enum in the database, so a made-up one must be refused
// rather than quietly stored.
const badCategory = await supabase.rpc('submit_prayer', {
  p_body: 'AUTOMATED CHECK - should never be stored',
  p_browser_id: '00000000-0000-4000-8000-000000000001',
  p_categories: ['not_a_real_category'],
})
check(
  'unknown category refused',
  Boolean(badCategory.error),
  badCategory.error ? '' : 'it was accepted',
)

// 2. An empty request is refused. The database is the last line, not the form.
const empty = await supabase.rpc('submit_prayer', {
  p_body: '   ',
  p_browser_id: '00000000-0000-4000-8000-000000000001',
})
check('empty request refused', Boolean(empty.error), empty.error ? '' : 'it was accepted')

// 3. Half-filled contact details are refused, so nobody asks to be reached and
//    then cannot be.
const halfNamed = await supabase.rpc('submit_prayer', {
  p_body: 'AUTOMATED CHECK - should never be stored',
  p_browser_id: '00000000-0000-4000-8000-000000000001',
  p_first_name: 'Testrow',
})
check(
  'half-filled contact details refused',
  Boolean(halfNamed.error),
  halfNamed.error ? '' : 'it was accepted',
)

// 3b. Asking to talk with no way to be reached is refused, so nobody waits on a
//     call that cannot be made.
const unreachable = await supabase.rpc('submit_prayer', {
  p_body: 'AUTOMATED CHECK - should never be stored',
  p_browser_id: '00000000-0000-4000-8000-000000000001',
  p_kind: 'counseling',
})
check(
  'anonymous counseling without a number refused',
  Boolean(unreachable.error),
  unreachable.error ? '' : 'it was accepted',
)

// 4-7. The public key can read nothing at all.
for (const table of ['submissions', 'submitters', 'team_members']) {
  const { data, error } = await supabase.from(table).select('*').limit(1)
  check(
    'public key cannot read ' + table,
    Boolean(error) || (data?.length ?? 0) === 0,
    error ? '' : 'it returned ' + data.length + ' row(s)',
  )
}

// 7. And nothing through the prayer team's view either.
const view = await supabase.from('submissions_for_team').select('*').limit(1)
check(
  'public key cannot read submissions_for_team',
  Boolean(view.error) || (view.data?.length ?? 0) === 0,
  view.error ? '' : 'it returned ' + view.data.length + ' row(s)',
)

// 8. And nothing through leadership's follow-up list, which holds phone numbers.
const leadership = await supabase.from('counseling_for_leadership').select('*').limit(1)
check(
  'public key cannot read counseling_for_leadership',
  Boolean(leadership.error) || (leadership.data?.length ?? 0) === 0,
  leadership.error ? '' : 'it returned ' + leadership.data.length + ' row(s)',
)

// 9. The monthly trend is team-only too. It is counts rather than words, but
//    counts of a church's prayer requests are still nobody else's business.
const trend = await supabase.rpc('monthly_stats', { p_months: 3 })
check(
  'public key cannot read the monthly trend',
  Boolean(trend.error),
  trend.error ? '' : 'it returned ' + JSON.stringify(trend.data),
)

// 10. The live site is running the code in this repository.
//
//     Everything above talks to Supabase directly and never touches the
//     deployment, which is how a stale build stayed invisible: every check
//     passed while the public site served old code. Vercel stamps the commit
//     into a meta tag at build time; this reads it back and compares.
//
//     Skipped when commits are not pushed, because the live site is then
//     correctly behind, and failing every run would train people to ignore it.
const SITE = process.env.PRAYER_SITE_URL || 'https://send-a-prayer.vercel.app'

function git(args) {
  try {
    return execFileSync('git', args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return ''
  }
}

const head = git(['rev-parse', 'HEAD'])
const unpushed = git(['log', 'origin/main..HEAD', '--oneline'])

if (!head) {
  console.log('SKIP  live site runs this commit — not a git checkout')
} else if (unpushed) {
  const count = unpushed.split('\n').filter(Boolean).length
  console.log(`SKIP  live site runs this commit — ${count} commit(s) not pushed yet`)
} else {
  let live = ''
  let reason = ''
  try {
    const response = await fetch(SITE, { cache: 'no-store' })
    if (!response.ok) {
      reason = 'the site answered ' + response.status
    } else {
      const html = await response.text()
      live = html.match(/<meta name="build-commit" content="([^"]*)"/)?.[1] ?? ''
      if (!live) reason = 'no build-commit meta tag — the deployment predates this check'
    }
  } catch (error) {
    reason = 'could not reach ' + SITE + ': ' + error.message
  }

  check(
    'live site runs this commit',
    live === head,
    reason || (live === head ? '' : `live is on ${live.slice(0, 7)}, HEAD is ${head.slice(0, 7)}`),
  )
}

console.log('')
if (failures.length) {
  console.error(failures.length + ' check(s) failed: ' + failures.join(', '))
  process.exit(1)
}
console.log('All checks passed. Remove the test row with:')
console.log("  delete from submissions where body like 'AUTOMATED CHECK%';")
