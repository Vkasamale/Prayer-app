// A scroll: two staves with their finials, and a sheet hanging between them.
//
// Ported from the Claude Design export, which builds this from real elements
// rather than pseudo-elements. That is not incidental: the sheet needs its own
// stacking context for the mask that tears its edges, and the staves have to
// paint above the sheet so the curl passes behind them. Two pseudo-elements
// cannot hold four finials, a sheet and two rods.
//
// `small` is the running-head size. Everything else is the written-in size.

export default function Scroll({
  small = false,
  className = '',
  children,
}: {
  small?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={['scroll', small ? 'scroll-sm' : '', className].filter(Boolean).join(' ')}>
      <Stave />
      <div className="sheet">{children}</div>
      <Stave />
    </div>
  )
}

function Stave() {
  return (
    <div className="stave">
      <i className="finial finial-l" />
      <i className="finial finial-r" />
    </div>
  )
}

// A sheet with no staves: the same parchment, for a field too small to be worth
// rolling. The export uses this for first name, last name and phone — they sit
// on scroll paper, but a one-line field hung between two rods reads as a banner.
//
// The padding and margin come from the export, where they are inline on each of
// these wrappers (`margin-block:0;padding:.7rem 1rem`). They are a class here
// because three identical inline styles are three chances to mistype one.

export function Sheet({ children }: { children: React.ReactNode }) {
  return <div className="sheet sheet-field">{children}</div>
}
