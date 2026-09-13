// Two rules from AGENTS.md, enforced instead of trusted.
//
//   1. Never run `next build` while the dev server is running. It overwrites
//      .next underneath the running server and the app throws module errors
//      that look like real bugs.
//   2. Never push a commit that adds a migration without knowing the migration
//      is applied. Code shipped ahead of its migration took down every
//      submission on the live site, not only the counseling ones.
//
// Node rather than shell: there is no jq on this machine, and the first version
// of this hook used it and silently allowed everything.
//
// Reads the PreToolUse payload on stdin. Prints a deny decision, or nothing.

import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

function deny(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason,
      },
    }),
  )
  process.exit(0)
}

function quiet(file, args) {
  try {
    return execFileSync(file, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  } catch {
    return ''
  }
}

let command = ''
try {
  command = JSON.parse(readFileSync(0, 'utf8')).tool_input?.command ?? ''
} catch {
  process.exit(0)
}
if (!command) process.exit(0)

if (command.includes('next build')) {
  // A dev server holding port 3000 is the thing that makes this dangerous.
  const listening = quiet('netstat', ['-ano'])
    .split('\n')
    .some((line) => /[:.]3000\s/.test(line) && /LISTEN/i.test(line))
  if (listening) {
    deny(
      'The dev server is listening on port 3000. `next build` overwrites .next ' +
        'underneath it, and the running app starts throwing module errors that look ' +
        'like real bugs (AGENTS.md — it cost time twice). Use `npx tsc --noEmit` to ' +
        'check types, or stop the dev server first.',
    )
  }
}

// A heredoc body is data, not commands. Without this, writing a document that
// mentions the push command trips the guard, and a guard that fires on prose is
// one people learn to ignore. Found the hard way: this hook blocked the writing
// of the handover that explains how to push.
function withoutHeredocs(text) {
  const lines = text.split('\n')
  const kept = []
  let terminator = null
  for (const line of lines) {
    if (terminator !== null) {
      if (line.trim() === terminator) terminator = null
      continue
    }
    const opener = line.match(/<<-?\s*['"]?([A-Za-z_][A-Za-z0-9_]*)['"]?/)
    if (opener) terminator = opener[1]
    kept.push(line)
  }
  return kept.join('\n')
}

if (/\bgit\s+push\b/.test(withoutHeredocs(command))) {
  const added = quiet('git', [
    'log',
    // Overridable only so this hook can be tested against a base where a
    // migration really was added; in normal use it is origin/main.
    (process.env.PRAYER_PUSH_BASE || 'origin/main') + '..HEAD',
    '--diff-filter=A',
    '--name-only',
    '--pretty=format:',
    '--',
    'supabase/migrations/',
  ])
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  if (added.length) {
    deny(
      'These commits add migrations, and pushing to main deploys immediately:\n\n' +
        [...new Set(added)].map((f) => '  ' + f).join('\n') +
        '\n\nCode that calls a function the live database does not have takes down ' +
        'every submission, not only the new path (AGENTS.md). Apply the migration in ' +
        'Supabase and confirm it against the database, then push. If it is already ' +
        'applied, say so and run the push again.',
    )
  }
}
