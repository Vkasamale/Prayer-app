'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CHURCH_NAME } from '@/lib/church'

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

        {shown.length === 0 ? (
          <p className="empty">
            {showPrayed
              ? 'Nothing has been marked prayed over yet.'
              : 'Nothing is waiting. The list is clear.'}
          </p>
        ) : (
          <ul className="requests">
            {shown.map((row) => (
              <li
                key={row.id}
                className={'request' + (row.flagged_urgent ? ' request-urgent' : '')}
              >
                <div className="request-meta">
                  <span className="who">
                    {row.is_named ? (row.first_name ?? 'Name removed') : 'Anonymous'}
                  </span>
                  {row.kind === 'counseling' && (
                    <span className="tag tag-counseling">Wants to talk</span>
                  )}
                  {row.flagged_urgent && <span className="tag tag-urgent">Urgent</span>}
                  <span className="when">
                    {new Date(row.created_at).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>

                <p className="request-body">
                  {row.body ?? (
                    <em className="cleared">Cleared by the retention policy.</em>
                  )}
                </p>

                <div className="request-actions">
                  <button
                    className="quiet-button"
                    onClick={() =>
                      update(row.id, {
                        prayed_over_at: row.prayed_over_at
                          ? null
                          : new Date().toISOString(),
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
