import Link from 'next/link'
import { EMERGENCY_CONTACTS, REVIEW_CADENCE } from '@/lib/church'
import ShareLink from './ShareLink'

// The identity choice, shown before the form and before anything is typed.
//
// Two things are deliberate here and should survive future edits:
//
// 1. The crisis notice is static and always visible. It is not triggered by
//    anything the person writes, because detection fails quietly on exactly the
//    people it matters most for. See PROJECT_BRIEF.md section 10b. The church
//    has no crisis line, so what the notice carries is the plain truth that
//    nobody is reading this in real time.
//
// 2. The church is not named anywhere on the congregation's side. Someone may
//    pass this link to a friend who has no warm feelings towards the church, or
//    towards church in general, and a name at the top gives them a reason to
//    close the tab before reading a word. The disclaimer still says who reads
//    the requests, so nobody is submitting into the dark.
//
// 3. Staying anonymous is listed first and given equal visual weight. The usual
//    pattern buries the anonymous option as a grey afterthought, which tells
//    someone the way they want to do this is the lesser way. This app exists for
//    the person who will not walk to the front, so that ordering is inverted.

export default function IdentityChoice() {
  return (
    <>
      <div className="glow" aria-hidden="true" />

      <main className="page">
        <section className="notice" aria-label="Before you start">
          <p>
            <strong>Nobody is reading this page right now.</strong> Requests are
            prayed over {REVIEW_CADENCE}, so please do not wait here for a reply.
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
          <h1>Share what is on your heart.</h1>
          <p className="lede">
            The prayer team will pray over what you send. First, choose how you
            would like to be known.
          </p>
        </header>

        <nav className="paths" aria-label="How you would like to be known">
          <Link className="path" href="/request?identity=anonymous">
            <p className="path-name">Stay anonymous</p>
            <p className="path-detail">
              No name, no number, nothing kept. We will not know who you are, and
              we will not try to find out.
            </p>
          </Link>

          <Link className="path" href="/request?identity=named">
            <p className="path-name">Share your name</p>
            <p className="path-detail">
              Your first name, last name and phone number. The prayer team can
              pray for you by name, and reach you if you would like to talk.
            </p>
          </Link>
        </nav>

        <ShareLink />

        <footer className="footnote">
          <p>
            <strong>Only the prayer team and church leadership can read what you
            send.</strong> It is not posted anywhere, not shown to the
            congregation, and not shared outside that team.
          </p>
          <p>
            Choosing to stay anonymous keeps you anonymous. There is no sign-in
            here, and never will be.
          </p>
          <p>
            If you share your name, the church keeps your contact details so the
            team can follow up. Ask any time and we will remove them.
          </p>
        </footer>
      </main>
    </>
  )
}
