'use client'

import { useState } from 'react'

// The QR code, shown on the page so one person can hold it up and another can
// scan it off the screen. That is the whole point: the poster is not always in
// the room, and a phone already is.
//
// Saving is done by drawing the SVG onto a canvas in the browser rather than
// shipping a second PNG file. One source of truth for the code itself, and the
// saved image can be far larger than any file worth committing.
//
// The share sheet takes the image itself where the browser allows it, so it
// goes into WhatsApp as a picture rather than a link. Where it does not, the
// same blob is offered as a download. Nothing is uploaded anywhere: the canvas
// never leaves the phone.

const SVG_PATH = '/qr/send-a-prayer.svg'
const SAVED_SIZE = 1024

export default function QrCode() {
  const [shown, setShown] = useState(false)
  const [note, setNote] = useState('')

  // The SVG carries a viewBox but no width or height, which some browsers
  // refuse to draw. Injecting both before rasterising avoids a blank canvas.
  async function toBlob(): Promise<Blob> {
    const markup = await fetch(SVG_PATH).then((r) => r.text())
    const sized = markup.replace(
      '<svg ',
      `<svg width="${SAVED_SIZE}" height="${SAVED_SIZE}" `,
    )
    const url = URL.createObjectURL(new Blob([sized], { type: 'image/svg+xml' }))

    try {
      const image = new Image()
      image.src = url
      await image.decode()

      const canvas = document.createElement('canvas')
      canvas.width = SAVED_SIZE
      canvas.height = SAVED_SIZE
      const context = canvas.getContext('2d')
      if (!context) throw new Error('no canvas context')
      // A QR code is squares. Smoothing them turns sharp edges into grey mush
      // that some scanners refuse.
      context.imageSmoothingEnabled = false
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, SAVED_SIZE, SAVED_SIZE)
      context.drawImage(image, 0, 0, SAVED_SIZE, SAVED_SIZE)

      return await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('no blob'))),
          'image/png',
        )
      })
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  async function save() {
    setNote('')
    let blob: Blob
    try {
      blob = await toBlob()
    } catch {
      setNote('The code could not be saved. Take a screenshot of it instead.')
      return
    }

    const file = new File([blob], 'prayer-requests-qr.png', { type: 'image/png' })

    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Prayer requests' })
        return
      } catch {
        // Dismissing the sheet is not a failure. Fall through to the download,
        // which still gets the image onto the phone.
      }
    }

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'prayer-requests-qr.png'
    link.click()
    URL.revokeObjectURL(url)
    setNote('Saved as an image. It is in your downloads.')
  }

  return (
    <div className="qr">
      <button
        className="quiet-button"
        type="button"
        aria-expanded={shown}
        onClick={() => setShown(!shown)}
      >
        {shown ? 'Hide the QR code' : 'Show the QR code'}
      </button>

      {shown && (
        <figure className="qr-plate">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="qr-image"
            src={SVG_PATH}
            alt="QR code linking to this page. Point a phone camera at it."
            width={220}
            height={220}
          />
          <figcaption className="qr-caption">
            Point a phone camera at this, or press and hold the code to save it.
          </figcaption>
          <button className="quiet-button" type="button" onClick={save}>
            Save or send the code
          </button>
          {note && (
            <p className="share-note" role="status">
              {note}
            </p>
          )}
        </figure>
      )}
    </div>
  )
}
