/**
 * The display case — the one showpiece of Plain View.
 *
 * A dark, lit box in an otherwise plain page. Products stand one behind another
 * in depth; the one being read comes to the front in its own light. Pure CSS 3D:
 * no WebGL, so it costs almost nothing and needs no fallback.
 */
import { motion, useReducedMotion } from 'motion/react'
import { useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import type { Product } from '../../data/products'
import { realMedia } from '../../media/manifest'
import { PhoneFrame, ProductMedia, WindowFrame } from '../../media/ProductMedia'
import { ZoomDialog } from '../../media/ZoomDialog'
import { EASE, hueVars, surfaceWord } from './ui'

/** How a product stands in the case. Derived from what it runs on, so a new product needs no code. */
type Pose = 'desk-phone' | 'phone-desk' | 'desk' | 'phones'
function poseOf(p: Product): Pose {
  if (p.surfaces.length < 2) return p.primarySurface === 'desktop' ? 'desk' : 'phones'
  return p.primarySurface === 'desktop' ? 'desk-phone' : 'phone-desk'
}

function Arrangement({ product, slot, flip, eager }: { product: Product; slot: number; flip: boolean; eager?: boolean }) {
  const pose = poseOf(product)
  const restricted = product.stage === 'internal'
  const label = product.focus[slot - 1]?.title
  const win = (s: number, l?: string) => (
    <WindowFrame title={product.name} className="pv-a-win">
      <ProductMedia product={product} surface="desktop" slot={s} label={l} priority={eager} />
      {restricted && (
        <>
          <span className="pv-hatch" aria-hidden="true" />
          <span className="pv-seal">Internal — screens not shown</span>
        </>
      )}
    </WindowFrame>
  )
  const phone = (s: number, l?: string, extra = '') => (
    <PhoneFrame className={`pv-a-phone ${extra}`}>
      <ProductMedia product={product} surface="mobile" slot={s} label={l} priority={eager} />
    </PhoneFrame>
  )
  const other = slot === 1 ? 2 : 1
  return (
    <div className="pv-a" data-pose={pose} data-flip={flip || undefined}>
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
          {phone(other, product.focus[other - 1]?.title, 'pv-a-phone-back')}
          {phone(slot, label)}
        </>
      )}
    </div>
  )
}

export function Case({
  items,
  active,
  slot = 1,
  eager,
}: {
  /** Products standing in the case, front to back. One item = a single-product case. */
  items: Product[]
  active: number
  /** Which capture of the front product to show (1-based; matches its "What it covers" list). */
  slot?: number
  eager?: boolean
}) {
  const reduce = useReducedMotion()
  const world = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(false)
  const product = items[active]
  const surface = product.primarySurface
  const restricted = product.stage === 'internal'
  const placeholder = !realMedia(product.slug, surface, slot)
  const topic = product.focus[slot - 1]?.title

  // The case tilts a few degrees toward a mouse pointer. Touch and reduced motion leave it still.
  const tilt = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== 'mouse' || !world.current) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    world.current.style.setProperty('--ry', `${(x * 9).toFixed(2)}deg`)
    world.current.style.setProperty('--rx', `${(-y * 6).toFixed(2)}deg`)
  }
  const level = () => {
    world.current?.style.setProperty('--ry', '0deg')
    world.current?.style.setProperty('--rx', '0deg')
  }

  return (
    <div className="pv-case" style={{ ...hueVars(product), '--i': active } as CSSProperties} onPointerMove={tilt} onPointerLeave={level}>
      <div className="pv-case-scene">
        <div className="pv-case-glow" aria-hidden="true" />
        <div className="pv-case-floor" aria-hidden="true" />
        <div className="pv-case-world" ref={world}>
          {items.map((p, i) => {
            const d = i - active
            const front = d === 0
            const target = front
              ? { z: 0, y: 0, opacity: 1 }
              : d > 0
                ? { z: -d * 430, y: -d * 62, opacity: [0.46, 0.24, 0.12, 0.05][d - 1] ?? 0 }
                : { z: 460, y: 46, opacity: 0 }
            return (
              <motion.div
                key={p.slug}
                className="pv-case-item"
                style={{ ...hueVars(p), zIndex: 50 - Math.abs(d), pointerEvents: 'none' }}
                initial={false}
                animate={target}
                transition={reduce ? { duration: 0 } : { duration: 0.8, ease: EASE }}
                aria-hidden={!front}
              >
                <Arrangement product={p} slot={front ? slot : 1} flip={i % 2 === 1} eager={eager && front} />
              </motion.div>
            )
          })}
        </div>
      </div>
      <div className="pv-case-bar">
        <p aria-live="polite">
          {(items.length > 1 || !topic || restricted) && <b>{product.name}</b>}
          <span>
            {topic && !restricted ? (
              <>
                <span className="pv-case-surface">{surfaceWord(surface)} · </span>
                {topic}
              </>
            ) : (
              surfaceWord(surface)
            )}
          </span>
        </p>
        <div className="pv-case-tools">
          {restricted ? (
            <span className="pv-case-note pv-case-note-keep">Internal tool — screens not shown</span>
          ) : (
            placeholder && <span className="pv-case-note">Placeholder image</span>
          )}
          {!restricted && (
            <button type="button" className="pv-case-zoom" onClick={() => setZoom(true)}>
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <circle cx="6" cy="6" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="m9.3 9.3 3.2 3.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Enlarge
            </button>
          )}
        </div>
      </div>
      {zoom && <ZoomDialog product={product} surface={surface} slot={slot} label={topic} onClose={() => setZoom(false)} />}
    </div>
  )
}
