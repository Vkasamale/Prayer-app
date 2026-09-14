'use client'

import { useEffect, useLayoutEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

// The book turns its own leaves.
//
// The first screen is a right-hand page, the way a book falls open at the
// start. Go anywhere and the leaf turns: the next screen is a left-hand page,
// the one after that a right-hand page again, and so on. The spine and the gilt
// block edge swap sides with it, because a leaf carries its own gutter — that
// is what makes the alternation read as turning rather than as decoration.
//
// This lives in template.tsx rather than layout.tsx for one reason: Next
// remounts a template on every navigation and keeps a layout mounted. The
// remount is the page turn. Nothing here listens for route changes, because it
// does not have to.
//
// Which side a screen falls on is decided in the browser and never on the
// server. Two reasons, and the second is the serious one:
//
//   1. The server rendered one side and the browser worked out another, so
//      React reported a hydration mismatch on every navigation.
//   2. A module-level counter on the server is shared by every request that
//      process handles. Whose leaf was turned last is a fact about one person's
//      browsing, and it has no business being held anywhere other people's
//      requests can read it.
//
// So the markup ships as a right-hand page and the browser corrects it before
// paint. A reload opens the book at the beginning again, which is right: a
// reload is not a page turn.

let leavesTurned = 0
let lastPath: string | null = null

function sideFor(pathname: string) {
  if (pathname !== lastPath) {
    // The first path seen is where the book falls open: a right-hand page.
    if (lastPath !== null) leavesTurned++
    lastPath = pathname
  }
  return leavesTurned % 2 === 0 ? 'recto' : 'verso'
}

// Before paint in the browser, and a no-op on the server, where React warns
// that layout effects cannot run. The choice is made once per environment, so
// the hook order never changes between renders.
const useBeforePaint = typeof window === 'undefined' ? useEffect : useLayoutEffect

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [side, setSide] = useState('recto')

  useBeforePaint(() => {
    setSide(sideFor(pathname))
  }, [pathname])

  return (
    <div className="leaf" data-side={side}>
      {children}
    </div>
  )
}
