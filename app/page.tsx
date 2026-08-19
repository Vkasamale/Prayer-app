import Link from 'next/link'
import { CHURCH_NAME, CRISIS_CONTACT, PRAYER_DAY } from '@/lib/church'

// The identity choice, shown before the form and before anything is typed.
//
// Two things are deliberate here and should survive future edits:
//
// 1. The crisis notice is static and always visible. It is not triggered by
//    anything the person writes, because detection fails quietly on exactly the
//    people it matters most for. See PROJECT_BRIEF.md section 10b.
//
// 2. Staying anonymous is listed first and given equal visual weight. The usual
//    pattern buries the anonymous option as a grey afterthought, which tells
//    someone the way they want to do this is the lesser way. This app exists for
//    the person who will not walk to the front, so that ordering is inverted.

export default function IdentityChoice() {
  const telHref = 'tel:' + CRISIS_CONTACT.phone.replace(/\s/g, '')

  return (
    <>
      <div className="glow" aria-hidden="true" />

      <main className="page">
        <section className="notice" aria-label="Before you start">
          <p>
            <strong>If you are in danger right now, call {CRISIS_CONTACT.label} on{' '}
            <a href={telHref}>{CRISIS_CONTACT.phone}</a>.</strong>
          </p>
          <p>
            Requests here are read by the prayer team on {PRAYER_DAY}. Nobody is
            watching this page as you type, so please do not wait on it in an
            emergency.
          </p>
        </section>

        <header>
          <p className="eyebrow">{CHURCH_NAME}</p>
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

        <footer className="footnote">
          <p>
            Choosing to stay anonymous keeps you anonymous. There is no sign-in
            here, and never will be.
          </p>
          <p>
            If you share your name, {CHURCH_NAME} keeps your contact details so
            the team can follow up. Ask us any time and we will remove them.
          </p>
        </footer>
      </main>
    </>
  )
}
