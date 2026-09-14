import Link from 'next/link'
import RequestForm from './RequestForm'

// The form itself. Which path the person picked arrives as a query parameter
// rather than being asked again — they have already chosen once, and asking
// twice would read as doubting the answer.

export default async function RequestPage({
  searchParams,
}: {
  searchParams: Promise<{ identity?: string }>
}) {
  const { identity } = await searchParams

  // Anything other than an explicit 'named' is treated as anonymous. A mangled
  // or missing parameter must never fall through to collecting a name.
  if (identity !== 'named' && identity !== 'anonymous') {
    return (
      <>
        <div className="leaf-edges" aria-hidden="true" />
        <main className="page">
          <header>
            <h1>Let us start again.</h1>
            <p className="lede">
              We lost track of whether you wanted to share your name. Nothing has
              been sent.
            </p>
          </header>
          <nav className="paths">
            <Link className="path" href="/">
              <p className="path-name">Back to the start</p>
              <p className="path-detail">Choose how you would like to be known.</p>
            </Link>
          </nav>
        </main>
      </>
    )
  }

  return <RequestForm isNamed={identity === 'named'} />
}
