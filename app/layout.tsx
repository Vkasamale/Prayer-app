import type { Metadata, Viewport } from 'next'
import './globals.css'

// The church is deliberately not named here. This title is what appears in a
// browser tab, and in the preview card when somebody sends the link through
// WhatsApp or Messenger — the moment a name would decide whether the person on
// the other end opens it at all.
export const metadata: Metadata = {
  title: 'Prayer requests',
  description:
    'Send a prayer request to a church prayer team, with your name or without it.',
  // The QR code sits in a public building, so anything scanning it could index
  // the page. Nothing here should end up in a search result.
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: '#f4ecdc',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* The commit this build came from, stamped by Vercel at build time.
            npm run verify reads it off the live site and compares it to HEAD.
            Without it a stale deployment is invisible: every other check talks
            to Supabase directly, so they all passed happily while the public
            site served an old build for a day.
            A sha is not a secret — it is on every commit in the repository —
            and it names nothing about the church. */}
        <meta name="build-commit" content={process.env.VERCEL_GIT_COMMIT_SHA ?? 'local'} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* One family, the way a Bible is set. Karla is gone: a second face was
            doing nothing the serif could not do, and this loads less. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Petrona:ital,wght@0,400;0,500;0,600;1,400&display=swap"
        />
      </head>
      <body>
        {/* The torn edge of every scroll, defined once and referenced by CSS.
            feTurbulence generates noise; feDisplacementMap pushes the sheet's
            own edge around by that noise, so no two millimetres of the edge
            tear alike. A repeating shape would be spotted immediately.
            baseFrequency is deliberately uneven — low across, higher down — so
            the tearing runs along the sides rather than the top and bottom,
            which is where a rolled sheet is cut straight. */}
        <svg width="0" height="0" aria-hidden="true" focusable="false">
          <filter id="torn-edge">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.09"
              numOctaves="3"
              seed="7"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="11"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </svg>
        {children}
      </body>
    </html>
  )
}
