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

// 4-6. The public key can read nothing at all.
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

console.log('')
if (failures.length) {
  console.error(failures.length + ' check(s) failed: ' + failures.join(', '))
  process.exit(1)
}
console.log('All checks passed. Remove the test row with:')
console.log("  delete from submissions where body like 'AUTOMATED CHECK%';")
