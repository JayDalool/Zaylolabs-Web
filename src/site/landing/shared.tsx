/**
 * Pieces shared by both landing versions: one app's words, one app's screens,
 * and a one-screen section that holds both. Everything is sized from the
 * viewport height so a whole app fits on the screen at once.
 */
import type { CSSProperties } from 'react'
import { products, type Product } from '../../data/products'
import { PhoneFrame, ProductMedia, WindowFrame } from '../../media/ProductMedia'
import { useImmerse } from '../immerse'
import { BASE, ButtonLink, hueVars, StageBadge } from '../ui'

export const count = products.length

/** How an app stands: chosen from what it runs on, so a new app needs no code. */
type Pose = 'desk-phone' | 'phone-desk' | 'desk' | 'phones'
const poseOf = (p: Product): Pose =>
  p.surfaces.length < 2 ? (p.primarySurface === 'desktop' ? 'desk' : 'phones') : p.primarySurface === 'desktop' ? 'desk-phone' : 'phone-desk'

export function Withheld() {
  return (
    <>
      <span className="app-hatch" aria-hidden="true" />
      <span className="app-seal">Internal — screens not shown</span>
    </>
  )
}

/** One app's screens, arranged in depth. `slot` is the capture chosen from "What it covers". */
export function AppPose({ product, slot = 1, flip }: { product: Product; slot?: number; flip?: boolean }) {
  const pose = poseOf(product)
  const restricted = product.stage === 'internal'
  const label = product.focus[slot - 1]?.title
  const other = slot === 1 ? 2 : 1
  const win = (s: number, l?: string) => (
    <WindowFrame title={product.name} className="app-win">
      <ProductMedia product={product} surface="desktop" slot={s} label={l} />
      {restricted && <Withheld />}
    </WindowFrame>
  )
  const phone = (s: number, l?: string, extra = '') => (
    <PhoneFrame className={`app-phone ${extra}`}>
      <ProductMedia product={product} surface="mobile" slot={s} label={l} />
    </PhoneFrame>
  )
  return (
    <div className="app-media">
      <div className="app-pose" data-pose={pose} data-flip={flip || undefined}>
        {pose === 'desk-phone' && (
          <>
            {win(slot, label)}
            {phone(1)}
          </>
        )}
        {pose === 'phone-desk' && (
          <>
            {win(1)}
            {phone(slot, label)}
          </>
        )}
        {pose === 'desk' && win(slot, label)}
        {pose === 'phones' && (
          <>
            {phone(other, product.focus[other - 1]?.title, 'app-phone-back')}
            {phone(slot, label)}
          </>
        )}
      </div>
    </div>
  )
}

/** One app in words: what it is, what it covers, where it stands, and the way in. */
export function AppCopy({ product, slot, onSlot, heading = 'h2' }: { product: Product; slot: number; onSlot: (n: number) => void; heading?: 'h2' | 'h3' }) {
  const H = heading
  const restricted = product.stage === 'internal'
  return (
    <div className="app-copy">
      <p className="sp-mono app-kicker">
        <span className="app-kicker-n">
          Product {products.indexOf(product) + 1} of {count}
        </span>
        <span className="sp-mono-dim">{product.discipline}</span>
      </p>
      <H id={`${product.slug}-name`} className="sp-name app-name" style={{ '--n': product.name.length } as CSSProperties}>
        {product.name}
        {product.alias && <small>/ {product.alias}</small>}
      </H>
      <p className="app-tagline">{product.tagline}</p>
      <p className="app-summary">{product.summary}</p>
      <ul className="app-covers" aria-label="What it covers">
        {product.focus.map((f, k) =>
          restricted ? (
            <li key={f.title}>
              <div className="app-cover">
                <b>{f.title}</b>
                <span>{f.note}</span>
              </div>
            </li>
          ) : (
            <li key={f.title}>
              <button type="button" className="app-cover" aria-pressed={slot === k + 1} onClick={() => onSlot(k + 1)}>
                <b>{f.title}</b>
                <span>{f.note}</span>
              </button>
            </li>
          ),
        )}
      </ul>
      <p className="app-status">
        <StageBadge product={product} />
        <span>{product.availability}</span>
      </p>
      <div className="app-go">
        <ButtonLink to={`${BASE}/work/${product.slug}`}>Open {product.name}</ButtonLink>
        <ButtonLink ghost className="sp-btn sp-btn-ghost app-go-demo" to={`${BASE}/work/${product.slug}#demo`}>
          Watch the demo
        </ButtonLink>
      </div>
    </div>
  )
}

/** A whole app on one screen. It takes the app's colours while the visitor is in it. */
export function AppSection({ product, slot, onSlot, flip }: { product: Product; slot: number; onSlot: (n: number) => void; flip?: boolean }) {
  const { ref, on } = useImmerse<HTMLElement>()
  return (
    <section
      ref={ref}
      id={product.slug}
      className="app-screen sp-immersive sp-immersive-field sp-snap"
      data-hue=""
      data-flip={flip || undefined}
      data-immersed={on || undefined}
      style={hueVars(product) as CSSProperties}
      aria-labelledby={`${product.slug}-name`}
    >
      <div className="sp-wrap app-screen-grid">
        <AppCopy product={product} slot={slot} onSlot={onSlot} />
        <AppPose product={product} slot={slot} flip={flip} />
      </div>
    </section>
  )
}
