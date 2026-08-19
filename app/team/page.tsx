'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CHURCH_NAME } from '@/lib/church'
import { CATEGORIES, categoryLabel } from '@/lib/categories'

// The prayer team's view, worked through on the prayer day.
//
// The guard here is only about what the team sees on screen. It is not what
// keeps prayer requests private — that is row-level security in the database,
// which returns nothing at all to a client without a session. If this component
// were bypassed entirely, an unauthenticated browser would still read no rows.
//
// Contact details are not on this page. The prayer team prays by first name;
// leadership reads phone numbers from the submitters table separately.

type Stats = {
  submissions_total: number
  submissions_waiting: number
  submissions_prayed_over: number
  counseling_requests: number
  submitters_distinct: number
  submitters_named: number
  submitters_anonymous: number
  members_yes: number
  members_no: number
  members_unanswered: number
}

type Submission = {
  id: string
  body: string | null
  kind: 'prayer' | 'counseling'
  is_member: 'yes' | 'no' | null
  categories: string[]
  prayed_over_at: string | null
  flagged_urgent: boolean
  redacted_at: string | null
  created_at: string
  is_named: boolean
  first_name: string | null
  browser_id: string
}

export default function TeamPage() {
  const [ready, setReady] = useState(false)
  const [signedIn, setSignedIn] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSignedIn(Boolean(data.session))
      setReady(true)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session))
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  if (!ready) return null
  return signedIn ? <PrayerList /> : <SignIn />
}

function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setBusy(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setBusy(false)
    // Deliberately vague: naming which half was wrong tells anyone probing this
    // page which addresses belong to the team.
    if (signInError) setError('That email and password did not match.')
  }

  return (
    <>
      <div className="glow" aria-hidden="true" />
      <main className="page">
        <header>
          <p className="eyebrow">{CHURCH_NAME}</p>
          <h1>Prayer team</h1>
          <p className="lede">
            Accounts are set up by the church. There is no sign-up here.
          </p>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error && <p className="error" role="alert">{error}</p>}

          <button className="send" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </main>
    </>
  )
}

function PrayerList() {
  const [rows, setRows] = useState<Submission[] | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [showPrayed, setShowPrayed] = useState(false)
  const [grouped, setGrouped] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    // Urgent first, then oldest waiting first: someone who has been waiting a
    // fortnight should not sink below this morning's arrivals.
    const { data, error: loadError } = await supabase
      .from('submissions_for_team')
      .select('*')
      .order('flagged_urgent', { ascending: false })
      .order('created_at', { ascending: true })

    if (loadError) {
      setError('Could not load the list. Check your connection and reload.')
      return
    }
    setError(null)
    setRows(data as Submission[])

    // Counts come from the database rather than from the rows above, because
    // distinct-submitter counts cannot be worked out from a filtered list.
    const { data: statRows } = await supabase.rpc('dashboard_stats')
    setStats((statRows?.[0] as Stats) ?? null)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function update(id: string, patch: Record<string, unknown>) {
    const { error: updateError } = await supabase
      .from('submissions')
      .update(patch)
      .eq('id', id)
    if (updateError) {
      setError('That change did not save. Reload and try again.')
      return
    }
    load()
  }

  async function remove(id: string) {
    // Junk only. Permanent, so it asks first.
    if (!window.confirm('Delete this submission permanently? This cannot be undone.')) {
      return
    }
    const { error: deleteError } = await supabase.from('submissions').delete().eq('id', id)
    if (deleteError) {
      setError('That could not be deleted. Reload and try again.')
      return
    }
    load()
  }

  if (rows === null && !error) return null

  const waiting = (rows ?? []).filter((row) => !row.prayed_over_at)
  const prayed = (rows ?? []).filter((row) => row.prayed_over_at)
  const shown = showPrayed ? prayed : waiting

  return (
    <>
      <div className="glow" aria-hidden="true" />
      <main className="page page-wide">
        <header className="team-header">
          <div>
            <p className="eyebrow">{CHURCH_NAME}</p>
            <h1>Prayer team</h1>
          </div>
          <button className="quiet-button" onClick={() => supabase.auth.signOut()}>
            Sign out
          </button>
        </header>

        {error && <p className="error" role="alert">{error}</p>}

        {stats && <Dashboard stats={stats} />}

        <div className="tabs" role="tablist">
          <button
            role="tab"
            aria-selected={!showPrayed}
            className={'tab' + (!showPrayed ? ' tab-on' : '')}
            onClick={() => setShowPrayed(false)}
          >
            Waiting ({waiting.length})
          </button>
          <button
            role="tab"
            aria-selected={showPrayed}
            className={'tab' + (showPrayed ? ' tab-on' : '')}
            onClick={() => setShowPrayed(true)}
          >
            Prayed over ({prayed.length})
          </button>
        </div>

        {shown.length > 0 && (
          <label className="choice group-toggle">
            <input
              type="checkbox"
              checked={grouped}
              onChange={(event) => setGrouped(event.target.checked)}
            />
            <span>Group by what it is about</span>
          </label>
        )}

        {shown.length === 0 ? (
          <p className="empty">
            {showPrayed
              ? 'Nothing has been marked prayed over yet.'
              : 'Nothing is waiting. The list is clear.'}
          </p>
        ) : grouped ? (
          <>
            <Summary groups={groupByCategory(shown)} total={shown.length} />
            {groupByCategory(shown).map(({ key, label, rows: groupRows }) => (
              // A native details element: collapsing is the browser's job, and
              // it keeps a hundred requests from becoming an endless page.
              // Closed by default, because the meeting works one theme at a
              // time and the summary above already says what is waiting.
              <details key={key} className="group" name="prayer-group">
                <summary className="group-heading">
                  <span className="group-heading-inner">
                    {label} <span className="group-count">{groupRows.length}</span>
                  </span>
                </summary>
                <ul className="requests">
                  {groupRows.map((row) => (
                    <Request key={row.id} row={row} update={update} remove={remove} />
                  ))}
                </ul>
              </details>
            ))}
          </>
        ) : (
          <ul className="requests">
            {shown.map((row) => (
              <Request key={row.id} row={row} update={update} remove={remove} />
            ))}
          </ul>
        )}
      </main>
    </>
  )
}

// The tracking view: how much has come in, and how many different people it came
// from. Deliberately counts and nothing else — no behaviour, no individuals.
function Dashboard({ stats }: { stats: Stats }) {
  const answered = stats.members_yes + stats.members_no

  return (
    <section className="dashboard" aria-label="Totals">
      <ul className="stat-row">
        <Stat value={stats.submissions_total} label="requests in total" />
        <Stat value={stats.submissions_waiting} label="still waiting" />
        <Stat value={stats.submitters_distinct} label="different people" />
        <Stat value={stats.counseling_requests} label="asked to talk" />
      </ul>

      <p className="stat-note">
        {stats.submitters_anonymous} anonymous and {stats.submitters_named} named.
        The anonymous figure counts browsers, not people, so it is a floor — the
        same person on a new phone counts twice.
      </p>

      {answered > 0 && (
        <p className="stat-note">
          Of those who answered, {stats.members_yes} said they are part of the
          church and {stats.members_no} said they are not.{' '}
          {stats.members_unanswered} did not say.
        </p>
      )}
    </section>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <li className="stat">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </li>
  )
}

type RowAction = (id: string, patch: Record<string, unknown>) => void

function Request({
  row,
  update,
  remove,
}: {
  row: Submission
  update: RowAction
  remove: (id: string) => void
}) {
  return (
    <li className={'request' + (row.flagged_urgent ? ' request-urgent' : '')}>
      <div className="request-meta">
        <span className="who">
          {row.is_named ? (row.first_name ?? 'Name removed') : 'Anonymous'}
        </span>
        {row.kind === 'counseling' && <span className="tag tag-counseling">Wants to talk</span>}
        {row.flagged_urgent && <span className="tag tag-urgent">Urgent</span>}
        <span className="when">
          {new Date(row.created_at).toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
          })}
        </span>
      </div>

      <p className="request-body">
        {row.body ?? <em className="cleared">Cleared by the retention policy.</em>}
      </p>

      {/* Shown even when grouped: a request filed under provision may also be
          about family, and the team should see that without hunting for it. */}
      {row.categories.length > 1 && (
        <p className="also">Also: {row.categories.map(categoryLabel).join(', ')}</p>
      )}

      <div className="request-actions">
        <button
          className="quiet-button"
          onClick={() =>
            update(row.id, {
              prayed_over_at: row.prayed_over_at ? null : new Date().toISOString(),
            })
          }
        >
          {row.prayed_over_at ? 'Move back to waiting' : 'Mark prayed over'}
        </button>
        <button
          className="quiet-button"
          onClick={() => update(row.id, { flagged_urgent: !row.flagged_urgent })}
        >
          {row.flagged_urgent ? 'Remove urgent flag' : 'Flag urgent'}
        </button>
        <button className="quiet-button danger" onClick={() => remove(row.id)}>
          Delete
        </button>
      </div>
    </li>
  )
}

// A request appears under every category it was given, so the team can pray
// through provision in one pass without losing the ones that are also about
// family. Requests with no categories collect at the end under "Not sorted",
// which is a normal state: ticking a box is optional and always will be.
function groupByCategory(rows: Submission[]) {
  // Typed loosely on purpose: CATEGORIES is `as const`, so an inferred type
  // would not admit the "Not sorted" group appended below.
  const groups: { key: string; label: string; rows: Submission[] }[] = CATEGORIES.map(
    ({ value, label }) => ({
      key: value as string,
      label: label as string,
      rows: rows.filter((row) => row.categories.includes(value)),
    }),
  ).filter((group) => group.rows.length > 0)

  const unsorted = rows.filter((row) => row.categories.length === 0)
  if (unsorted.length > 0) {
    groups.push({ key: 'unsorted', label: 'Not sorted', rows: unsorted })
  }

  return groups
}

// What the prayer team sees the moment they open this on Wednesday: how much is
// waiting and what it is about, before opening a single theme.
function Summary({
  groups,
  total,
}: {
  groups: { key: string; label: string; rows: Submission[] }[]
  total: number
}) {
  const urgent = groups.flatMap((group) => group.rows).filter((row) => row.flagged_urgent)
  // The same request appears in several groups, so count distinct ids.
  const urgentCount = new Set(urgent.map((row) => row.id)).size
  const biggest = [...groups].sort((a, b) => b.rows.length - a.rows.length)[0]

  return (
    <section className="summary" aria-label="Summary">
      <p className="summary-line">
        <strong>
          {total} {total === 1 ? 'request' : 'requests'}
        </strong>{' '}
        to pray over, across {groups.length}{' '}
        {groups.length === 1 ? 'theme' : 'themes'}
        {biggest && groups.length > 1 && (
          <>
            . Most are about <strong>{biggest.label.toLowerCase()}</strong>
          </>
        )}
        .
      </p>

      {urgentCount > 0 && (
        <p className="summary-line summary-urgent">
          {urgentCount} {urgentCount === 1 ? 'is' : 'are'} flagged urgent.
        </p>
      )}
    </section>
  )
}
