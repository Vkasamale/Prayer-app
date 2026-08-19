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
  themeColor: '#101a1f',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Petrona:wght@400;500&family=Karla:wght@400;600&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
