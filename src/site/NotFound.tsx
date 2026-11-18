import { Link } from 'react-router-dom'
import { BASE, useTitle } from './ui'

/** Shown for any address the site does not have. */
export function NotFound() {
  useTitle('Not found')
  return (
    <div className="sp-wrap" style={{ paddingBlock: '6rem', minHeight: '60vh' }}>
      <p className="sp-mono sp-signal" style={{ margin: '0 0 1.2rem' }}>
        404
      </p>
      <h1 className="sp-h2">There is no page at that address.</h1>
      <p className="sp-body" style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem 1.4rem' }}>
        <Link className="sp-link" to="/">
          Go to the home page
        </Link>
        <Link className="sp-link" to={`${BASE}/work`}>
          See all products
        </Link>
      </p>
    </div>
  )
}
