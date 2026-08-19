'use client'

import { useState } from 'react'

// Sharing, through the browser's own share sheet.
//
// navigator.share opens whatever the person already has — WhatsApp, Messenger,
// Facebook, Messages, email — with no per-network buttons to maintain.
//
// Deliberately not the official Facebook or WhatsApp share widgets: those load
// third-party scripts, which would tell those companies who is looking at a
// prayer request page. That is the opposite of what this app promises. Nothing
// here leaves the browser except the link itself, and only when the person
// chooses to send it.
//
// On a desktop browser without a share sheet, it copies the link instead.

export default function ShareLink() {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')

  async function share() {
    const url = window.location.origin
    const payload = {
      title: 'Prayer requests',
      text: 'Somewhere to send a prayer request, with your name or without it.',
      url,
    }

    if (navigator.share) {
      try {
        await navigator.share(payload)
        return
      } catch {
        // Closing the share sheet without picking anything lands here, and is
        // not a failure. Fall through to copying, which is still useful.
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      setState('copied')
    } catch {
      setState('failed')
    }
  }

  return (
    <div className="share">
      <button className="quiet-button" type="button" onClick={share}>
        Share this with someone
      </button>
      {state === 'copied' && (
        <span className="share-note" role="status">
          Link copied. Paste it anywhere.
        </span>
      )}
      {state === 'failed' && (
        <span className="share-note" role="status">
          Copy the address from your browser bar to share it.
        </span>
      )}
    </div>
  )
}
