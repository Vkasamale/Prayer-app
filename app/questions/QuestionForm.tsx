'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getBrowserId } from '@/lib/browserId'
import { getSupabase } from '@/lib/supabase'
import Scroll, { Sheet } from '../Scroll'

// Questions and notes, kept apart from prayer requests.
//
// Deliberately the plainest form in the app. A question is not a confession:
// there is no category, no counselling path and no crisis notice, because none
// of them belong on "what time does the service start". Everything that makes
// the prayer form careful would make this one feel heavier than the thing it is
// collecting.
//
// A number is optional and asked for plainly: without it there is no way to
// answer, and the person should be the one deciding that. No name is asked for
// — the named path creates a person record and demands a full name and number
// together, which is far more than a question is worth.

const MAX_BODY = 5000

export default function QuestionForm() {
  const [body, setBody] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    const trimmed = body.trim()
    if (!trimmed) {
      setError('Write your question or note before sending it.')
      return
    }
    if (trimmed.length > MAX_BODY) {
      setError('That is longer than we can accept. Please shorten it a little.')
      return
    }

    setSending(true)
    const { error: sendError } = await getSupabase().rpc('submit_prayer', {
      p_body: trimmed,
      p_browser_id: getBrowserId(),
      p_kind: 'question',
      p_is_member: null,
      p_categories: [],
      p_first_name: null,
      p_last_name: null,
      p_phone: null,
      // A question with a number is handled the same way a request with one is:
      // the number lives on the submission, not on a submitter record, so a
      // question never creates a person in the database.
      p_contact_phone: phone.trim() || null,
      p_contact_whatsapp: whatsapp,
      p_contact_pref: phone.trim() ? 'call' : null,
    })
    setSending(false)

    if (sendError) {
      setError('That did not send. Your words are still here — please try once more.')
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <>
        <div className="leaf-edges" aria-hidden="true" />
        <main className="page">
          <Scroll small className="running-head">
          <p className="running-head-text">Questions and notes</p>
        </Scroll>
          <header>
            <h1 className="title">It has been sent.</h1>
            <p className="lede">
              {phone.trim()
                ? 'Someone will get back to you on the number you left.'
                : 'Nobody is reading this page, so please do not wait here for a reply.'}
            </p>
          </header>
          <nav className="paths">
            <Link className="path" href="/">
              <p className="path-name">Back to prayer requests</p>
              <p className="path-detail">Starts again from the beginning.</p>
            </Link>
          </nav>
        </main>
      </>
    )
  }

  return (
    <>
      <div className="leaf-edges" aria-hidden="true" />
      <main className="page">
        <Scroll small className="running-head">
          <p className="running-head-text">Questions and notes</p>
        </Scroll>

        <header>
          <h1 className="title">Ask a question or leave a note.</h1>
          <p className="lede">
            Anything that is not a prayer request — a question for the church, a
            comment, something you think we should know.
          </p>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="label" htmlFor="questionPhone">
              A number to reach you on (optional)
            </label>
            <p className="hint">Without one there is no way to answer you.</p>
            <Sheet>
              <input
                id="questionPhone"
                className="input"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </Sheet>
            <label className="choice">
              <input
                type="checkbox"
                checked={whatsapp}
                onChange={(event) => setWhatsapp(event.target.checked)}
              />
              <span>This number is on WhatsApp</span>
            </label>
          </div>

          <div className="field">
            <label className="label" htmlFor="questionBody">
              Write your question or note below
            </label>
            <Scroll>
              <textarea
                id="questionBody"
                className="textarea"
                value={body}
                maxLength={MAX_BODY}
                rows={7}
                onChange={(event) => setBody(event.target.value)}
                autoFocus
              />
            </Scroll>
          </div>

          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}

          <button className="send" type="submit" disabled={sending}>
            {sending ? 'Sending…' : 'Send'}
          </button>
        </form>
      </main>
    </>
  )
}
