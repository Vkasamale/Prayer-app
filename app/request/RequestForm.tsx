'use client'

import { useState } from 'react'
import Link from 'next/link'
import { EMERGENCY_CONTACTS, REVIEW_CADENCE } from '@/lib/church'
import ShareLink from '../ShareLink'
import { CATEGORIES, type Category } from '@/lib/categories'
import { getBrowserId } from '@/lib/browserId'
import { getSupabase } from '@/lib/supabase'

type Membership = 'yes' | 'no' | 'unanswered'

const MAX_BODY = 5000

export default function RequestForm({ isNamed }: { isNamed: boolean }) {
  const [body, setBody] = useState('')
  const [isMember, setIsMember] = useState<Membership>('unanswered')
  const [wantsCounseling, setWantsCounseling] = useState(false)
  const [contactPhone, setContactPhone] = useState('')
  const [contactWhatsapp, setContactWhatsapp] = useState(false)
  const [contactPref, setContactPref] = useState<'call' | 'in_person'>('call')
  const [categories, setCategories] = useState<Category[]>([])
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')

  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    const trimmed = body.trim()
    if (!trimmed) {
      setError('Write your request before sending it.')
      return
    }
    if (trimmed.length > MAX_BODY) {
      setError('That is longer than we can accept. Please shorten it a little.')
      return
    }
    if (!isNamed && wantsCounseling && !contactPhone.trim()) {
      setError('Leave a phone number so someone can reach you.')
      return
    }
    if (isNamed && (!firstName.trim() || !lastName.trim() || !phone.trim())) {
      setError(
        'The prayer team needs your first name, last name and phone number to reach you.',
      )
      return
    }

    setSending(true)
    const { error: sendError } = await getSupabase().rpc('submit_prayer', {
      p_body: trimmed,
      p_browser_id: getBrowserId(),
      p_kind: wantsCounseling ? 'counseling' : 'prayer',
      // 'unanswered' is stored as null: the question is optional, and declining
      // to answer is a real answer rather than a third category.
      p_is_member: isMember === 'unanswered' ? null : isMember,
      p_categories: categories,
      p_first_name: isNamed ? firstName.trim() : null,
      p_last_name: isNamed ? lastName.trim() : null,
      p_phone: isNamed ? phone.trim() : null,
      p_contact_phone: wantsCounseling && !isNamed ? contactPhone.trim() : null,
      p_contact_whatsapp: wantsCounseling ? contactWhatsapp : false,
      p_contact_pref: wantsCounseling ? contactPref : null,
    })
    setSending(false)

    if (sendError) {
      // Never surface the raw database error. It means nothing to the person
      // reading it, and this is the worst possible moment to show someone a
      // stack trace. Their words stay in the box so nothing is lost.
      setError('That did not send. Your words are still here — please try once more.')
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <>
        <div className="glow" aria-hidden="true" />
        <main className="page">
          <p className="running-head" aria-hidden="true">
            <span>Prayer requests</span>
            <span>1 Peter 5</span>
          </p>

          <header>
            <h1>It is with the prayer team.</h1>
            <p className="lede">
              They will pray over it {REVIEW_CADENCE}.
              {isNamed
                ? ' They have your number if you asked to talk.'
                : ' We do not know who you are, and we will not try to find out.'}
            </p>
            {/* Ink, not red: Peter is speaking, not Christ. The red-letter
                convention is the reason red exists in this palette, so using it
                here would make it decoration. */}
            <p className="verse verse-quiet">
              <span className="v-num">7</span>
              Casting all your care upon him; for he careth for you.
              <span className="verse-ref">1 Peter 5:7</span>
            </p>
          </header>

          <section className="notice" aria-label="If you need someone now">
            <p>
              <strong>Please do not wait on this page for a reply.</strong> Nobody
              is reading it.
            </p>
            {EMERGENCY_CONTACTS.length > 0 && (
              <p>
                If you are in danger, call{' '}
                {EMERGENCY_CONTACTS.map((contact, index) => (
                  <span key={contact.phone}>
                    {index > 0 && ' or '}
                    {contact.label} on <a href={'tel:' + contact.phone}>{contact.phone}</a>
                  </span>
                ))}
                .
              </p>
            )}
          </section>

          <nav className="paths">
            <Link className="path" href="/">
              <p className="path-name">Send another request</p>
              <p className="path-detail">Starts again from the beginning.</p>
            </Link>
          </nav>

          <ShareLink />
        </main>
      </>
    )
  }

  return (
    <>
      <div className="glow" aria-hidden="true" />
      <main className="page">
        <section className="notice" aria-label="Before you start">
          <p>
            <strong>Nobody is reading this page right now.</strong> The prayer
            team prays over these {REVIEW_CADENCE}.
          </p>
          {EMERGENCY_CONTACTS.length > 0 && (
            <p>
              If you are in danger, call{' '}
              {EMERGENCY_CONTACTS.map((contact, index) => (
                <span key={contact.phone}>
                  {index > 0 && ' or '}
                  {contact.label} on <a href={'tel:' + contact.phone}>{contact.phone}</a>
                </span>
              ))}
              .
            </p>
          )}
        </section>

        <header>
          <p className="eyebrow">{isNamed ? 'Sharing your name' : 'Staying anonymous'}</p>
          <h1>What would you like prayer for?</h1>
          {!isNamed && (
            <p className="lede">
              Nothing you write here is tied to you. No name, no number, no sign-in.
            </p>
          )}
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <fieldset className="field">
            <legend className="label">Do you go to this church?</legend>
            <p className="hint">You do not have to answer this.</p>
            <div className="choices">
              {(
                [
                  ['yes', 'Yes'],
                  ['no', 'No'],
                  ['unanswered', 'Prefer not to say'],
                ] as const
              ).map(([value, label]) => (
                <label key={value} className="choice">
                  <input
                    type="radio"
                    name="membership"
                    value={value}
                    checked={isMember === value}
                    onChange={() => setIsMember(value)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="field">
            <label className="label" htmlFor="body">
              Your request
            </label>
            <p className="hint">
              As much or as little as you want. Only the prayer team and church
              leadership read it, exactly as you wrote it.
            </p>
            <textarea
              id="body"
              className="input textarea"
              value={body}
              maxLength={MAX_BODY}
              rows={7}
              onChange={(event) => setBody(event.target.value)}
              autoFocus
            />
          </div>

          <fieldset className="field">
            <legend className="label">What is it about?</legend>
            <p className="hint">
              Tick as many as fit, or none at all. It helps the prayer team pray
              through similar things together.
            </p>
            <div className="choices">
              {CATEGORIES.map(({ value, label }) => (
                <label key={value} className="choice">
                  <input
                    type="checkbox"
                    checked={categories.includes(value)}
                    onChange={(event) =>
                      setCategories((current) =>
                        event.target.checked
                          ? [...current, value]
                          : current.filter((item) => item !== value),
                      )
                    }
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {isNamed && (
            <>
              <div className="field">
                <label className="label" htmlFor="firstName">
                  First name
                </label>
                <input
                  id="firstName"
                  className="input"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="lastName">
                  Last name
                </label>
                <input
                  id="lastName"
                  className="input"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="phone">
                  Phone number
                </label>
                <p className="hint">
                  Only the church leadership sees this. The prayer team prays for
                  you by first name.
                </p>
                <input
                  id="phone"
                  className="input"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>

            </>
          )}

          <div className="field">
            <label className="choice">
              <input
                type="checkbox"
                checked={wantsCounseling}
                onChange={(event) => setWantsCounseling(event.target.checked)}
              />
              <span>I would like someone to talk to, not only prayer.</span>
            </label>
          </div>

          {wantsCounseling && (
            <div className="nested">
              {!isNamed && (
                <div className="field">
                  <label className="label" htmlFor="contactPhone">
                    A number to reach you on
                  </label>
                  {/* Said plainly, before they type it. Giving a number is the one
                      thing that makes an anonymous person reachable, and they
                      should know that is what they are choosing. */}
                  <p className="hint">
                    No name needed. This number is kept with this request only, is
                    seen by church leadership alone, and is deleted with it. It is
                    never linked to anything else you have sent.
                  </p>
                  <input
                    id="contactPhone"
                    className="input"
                    type="tel"
                    autoComplete="tel"
                    value={contactPhone}
                    onChange={(event) => setContactPhone(event.target.value)}
                  />
                </div>
              )}

              <div className="field">
                <label className="choice">
                  <input
                    type="checkbox"
                    checked={contactWhatsapp}
                    onChange={(event) => setContactWhatsapp(event.target.checked)}
                  />
                  <span>This number is on WhatsApp</span>
                </label>
              </div>

              <fieldset className="field">
                <legend className="label">How would you rather talk?</legend>
                <div className="choices">
                  {(
                    [
                      ['call', 'Over the phone'],
                      ['in_person', 'Meet in person'],
                    ] as const
                  ).map(([value, label]) => (
                    <label key={value} className="choice">
                      <input
                        type="radio"
                        name="contactPref"
                        value={value}
                        checked={contactPref === value}
                        onChange={() => setContactPref(value)}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}

          <button className="send" type="submit" disabled={sending}>
            {sending ? 'Sending…' : 'Send to the prayer team'}
          </button>
        </form>
      </main>
    </>
  )
}
