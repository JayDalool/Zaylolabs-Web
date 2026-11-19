/**
 * An app's own mark and lettering, as the app itself shows them.
 *
 * Each wordmark uses the app's real typeface, weight and spacing (see app-mark
 * rules in specimen.css). Two apps have a mark of their own: My Expenses (a
 * receipt on a rounded square) and Command Center (a hexagonal C). EstateLab
 * and GYST are lettering only, because that is all the apps have today.
 * Everything is drawn in the surrounding text colour, so it sits on any page.
 */
import type { Product } from '../data/products'

function Mark({ slug }: { slug: string }) {
  if (slug === 'myexpenses')
    return (
      <svg className="am-mark" viewBox="0 0 512 512" aria-hidden="true" focusable="false">
        <rect width="512" height="512" rx="116" fill="currentColor" />
        <g fill="none" stroke="var(--paper)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" transform="translate(64 64) scale(16)">
          <path d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
        </g>
      </svg>
    )
  if (slug === 'commandcenter')
    return (
      <svg className="am-mark" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
        <path d="M20 2.5 35 11v18L20 37.5 5 29V11z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        <path d="M26 14.5a8 8 0 1 0 0 11" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
      </svg>
    )
  return null
}

export function AppMark({ product, className = '' }: { product: Product; className?: string }) {
  return (
    <span className={`am ${className}`} data-app={product.slug}>
      <Mark slug={product.slug} />
      <span className="am-name">{product.name}</span>
    </span>
  )
}
