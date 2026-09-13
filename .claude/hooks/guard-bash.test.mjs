// Run: node .claude/hooks/guard-bash.test.mjs
//
// The push rule is the half of this hook that can fail silently and the half
// that has already been wrong twice: once denying everything with no way to
// confirm, once firing on prose in a heredoc. Both of those are asserted here.
//
// The test builds a throwaway git repository rather than using this one, so it
// can commit a migration and then take the ledger away again.

import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import assert from 'node:assert/strict'

const hook = join(import.meta.dirname, 'guard-bash.mjs')

function git(cwd, ...args) {
  execFileSync('git', args, { cwd, stdio: 'ignore' })
}

// Returns the hook's decision: 'deny' or 'allow'.
function run(cwd, command, base) {
  const out = execFileSync('node', [hook], {
    cwd,
    input: JSON.stringify({ tool_input: { command } }),
    encoding: 'utf8',
    env: { ...process.env, PRAYER_PUSH_BASE: base },
  })
  if (!out.trim()) return 'allow'
  return JSON.parse(out).hookSpecificOutput.permissionDecision
}

const repo = mkdtempSync(join(tmpdir(), 'guard-test-'))
try {
  git(repo, 'init', '-q')
  git(repo, 'config', 'user.email', 'test@example.com')
  git(repo, 'config', 'user.name', 'Test')
  writeFileSync(join(repo, 'README'), 'base\n')
  git(repo, 'add', '.')
  git(repo, 'commit', '-qm', 'base')
  const base = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim()

  mkdirSync(join(repo, 'supabase', 'migrations'), { recursive: true })
  writeFileSync(join(repo, 'supabase/migrations/0099_example.sql'), 'select 1;\n')
  git(repo, 'add', '.')
  git(repo, 'commit', '-qm', 'add a migration')

  // No ledger at all: nothing is confirmed, so the push is refused.
  assert.equal(run(repo, 'git push origin main', base), 'deny', 'no ledger should deny')

  // A ledger that does not name this migration is no better than none.
  writeFileSync(join(repo, 'supabase/applied.txt'), '# nothing yet\n0001_other.sql 2026-01-01 seen\n')
  assert.equal(run(repo, 'git push origin main', base), 'deny', 'unlisted migration should deny')

  // Named in the ledger: this is the path the old hook had no way to reach.
  writeFileSync(
    join(repo, 'supabase/applied.txt'),
    '# comment\n\n0099_example.sql   2026-01-01   function present\n',
  )
  assert.equal(run(repo, 'git push origin main', base), 'allow', 'confirmed migration should pass')

  // A push that adds no migration was never the hook's business.
  assert.equal(run(repo, 'git push origin main', 'HEAD'), 'allow', 'no added migration should pass')

  // Prose that merely mentions the command must not trip it. This is the bug
  // that blocked the writing of the handover document.
  const heredoc = ['cat > NOTE <<EOF', 'To ship this, run git push origin main.', 'EOF'].join('\n')
  assert.equal(run(repo, heredoc, base), 'allow', 'heredoc body should not trip the guard')

  console.log('guard-bash: 5 checks passed')
} finally {
  rmSync(repo, { recursive: true, force: true })
}
