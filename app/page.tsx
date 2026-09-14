import Link from 'next/link'
import ShareLink from './ShareLink'
import QrCode from './QrCode'
import Scroll from './Scroll'

// The identity choice, shown before the form and before anything is typed.
//
// Two things are deliberate here and should survive future edits:
//
// 1. The crisis notice does not appear on this screen. It is carried by the
//    form screen instead (app/request/RequestForm.tsx), where it is static and
//    always visible rather than triggered by anything the person writes,
//    because detection fails quietly on exactly the people it matters most
//    for. See PROJECT_BRIEF.md section 10b.
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
      <div className="leaf-edges" aria-hidden="true" />

      <main className="page">
        <Scroll small className="running-head">
          <p className="running-head-text">Prayer requests</p>
        </Scroll>

        <header>
          <h1 className="title">Share what is on your heart.</h1>
          {/* Red because Christ is the one speaking — the red-letter
              convention, not an accent colour. See globals.css.
              NIV, which is copyrighted: Biblica permit up to 500 verses
              non-commercially provided the notice appears, and it does, in the
              footnote below. Two verses is well inside that. If this ever takes
              money, the permission has to be looked at again. */}
          <p className="verse verse-christ">
            <span className="v-num">28</span>
            Come to me, all you who are weary and burdened, and I will give you
            rest.
            <span className="verse-ref">Matthew 11:28 (NIV)</span>
          </p>
        </header>

        <nav className="paths" aria-label="How you would like to be known">
          <Link className="path" href="/request?identity=anonymous">
            <p className="path-name">Stay anonymous</p>
            <p className="path-detail">
              No name, nothing kept. We will not know who you are, and we will not
              try to find out — unless you ask us to get in touch, and leave a
              number for that alone.
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

        {/* Not a third identity choice: it is a different errand, so it sits
            below the rule rather than beside the two paths. */}
        <p className="aside">
          <Link href="/questions">Leave a note or comment instead.</Link>
        </p>

        <div className="actions">
          <ShareLink />
          <span className="actions-or" aria-hidden="true">or</span>
          <QrCode />
        </div>

        <footer className="footnote">
          <p>
            <strong>Note:</strong> Only the prayer team and church leadership
            can read what you send. It is not posted anywhere, not shown to the
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
          {/* A condition of using the NIV, not a courtesy. Biblica require the
              notice wherever their text appears. */}
          <p className="colophon">
            Scripture quotations taken from The Holy Bible, New International
            Version® NIV®. Copyright © 1973, 1978, 1984, 2011 by Biblica, Inc.™
            Used by permission. All rights reserved worldwide.
          </p>
        </footer>
      </main>
    </>
  )
}
