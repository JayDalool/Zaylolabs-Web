/**
 * Z-Axis site kit — the pieces every page shares: navigation, page shell,
 * the depth stack, frames and small labels. No page-specific knowledge.
 */
import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { products, studio, type Product, type Surface } from '../../data/products'
import { PhoneFrame, ProductMedia, WindowFrame } from '../../media/ProductMedia'
import { BrandMark } from './Copy'
import { BASE, SPACING } from './stations'

export const ZX = BASE
export const EASE = [0.2, 0.7, 0.2, 1] as const
export const two = (n: number) => String(n).padStart(2, '0')

/** A product's coordinate on the axis — the same number the flight HUD shows at its station. */
export const depthOf = (p: Product) => `Z −${((products.indexOf(p) + 1) * SPACING).toFixed(2).padStart(6, '0')}`

/** Scopes a subtree to one product's light: glow, rules, badges and schematic accents. */
export const hueStyle = (p: Product): CSSProperties =>
  ({
    '--hue': p.hue.bright,
    '--zx-hue': p.hue.bright,
    '--sch-accent': p.hue.bright,
    '--frame-shadow': `0 0 0 1px color-mix(in srgb, ${p.hue.bright} 28%, transparent), 0 50px 120px -50px color-mix(in srgb, ${p.hue.bright} 60%, transparent)`,
  }) as CSSProperties

/**
 * Primary navigation. Plain links, always in the same place on every page;
 * collapses to a full-screen menu on small screens.
 */
export function SiteNav({ onContact }: { onContact?: () => void }) {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [open])

  return (
    <nav className="zx-nav" aria-label="Primary">
      <button type="button" className="zx-nav-toggle" aria-expanded={open} aria-controls="zx-nav-links" onClick={() => setOpen((v) => !v)}>
        {open ? 'Close' : 'Menu'}
      </button>
      <div id="zx-nav-links" className={`zx-nav-links ${open ? 'is-open' : ''}`} onClick={(e) => (e.target as HTMLElement).closest('a') && setOpen(false)}>
        <NavLink to={ZX} end viewTransition>
          Home
        </NavLink>
        <NavLink to={`${ZX}/work`} end viewTransition>
          Work
        </NavLink>
        <NavLink to={`${ZX}/work/samvisionai`} viewTransition>
          SamVisionAI
        </NavLink>
        <NavLink to={`${ZX}/system`} viewTransition>
          System
        </NavLink>
        {onContact ? (
          <button
            type="button"
            className="zx-nav-cta"
            onClick={() => {
              setOpen(false)
              onContact()
            }}
          >
            Contact
          </button>
        ) : (
          <Link className="zx-nav-cta" to={`${ZX}#contact`} viewTransition>
            Contact
          </Link>
        )}
      </div>
    </nav>
  )
}

/** First tab stop on every page: jump past the header to the content. */
export function SkipLink({ label = 'Skip to content', onActivate }: { label?: string; onActivate?: () => void }) {
  return (
    <button type="button" className="zx-skip sr-only-focusable" onClick={onActivate ?? (() => document.getElementById('zx-main')?.focus())}>
      {label}
    </button>
  )
}

export function Brand() {
  return (
    <Link className="zx-brand" to={ZX} aria-label="ZayloLabs — home" viewTransition>
      <BrandMark />
      <span>
        Zaylo<b>Labs</b>
      </span>
    </Link>
  )
}

/** Shell for every page except the flight: sticky header, content, footer. */
export function PageShell({ readout, hue, children }: { readout: string; hue?: string; children: ReactNode }) {
  return (
    <div className="zx zx-page" style={hue ? ({ '--hue': hue, '--zx-hue': hue } as CSSProperties) : undefined}>
      <SkipLink />
      <header className="zx-top">
        <Brand />
        <SiteNav />
        <p className="zx-readout" aria-hidden="true">
          <span className="zx-readout-depth">{readout}</span>
        </p>
      </header>
      <main className="zx-main" id="zx-main" tabIndex={-1}>
        {children}
      </main>
      <footer className="zx-foot">
        <p className="zx-foot-word" aria-hidden="true">
          Zaylo<em>Labs</em>
        </p>
        <div className="zx-foot-row">
          <p>
            {studio.line} <span className="zx-dim">{studio.domain}</span>
          </p>
          <nav aria-label="Footer">
            <Link to={ZX} viewTransition>
              Home
            </Link>
            <Link to={`${ZX}/work`} viewTransition>
              Work
            </Link>
            <Link to={`${ZX}/system`} viewTransition>
              System
            </Link>
            <Link to={`${ZX}#contact`} viewTransition>
              Contact
            </Link>
          </nav>
          <p className="zx-dim">Design prototype — not deployed</p>
        </div>
      </footer>
    </div>
  )
}

export function Badge({ product }: { product: Product }) {
  return <span className="zx-badge">{product.stageLabel}</span>
}

export function SectionHead({ k, title, children }: { k: string; title: string; children?: ReactNode }) {
  return (
    <div className="zx-p-head">
      <p className="zx-p-key">{k}</p>
      <h2>{title}</h2>
      {children}
    </div>
  )
}

/** A capture inside the right chrome for its surface. */
export function Frame({
  product,
  surface,
  slot = 1,
  label,
  restricted,
  priority,
}: {
  product: Product
  surface?: Surface
  slot?: number
  label?: string
  restricted?: boolean
  priority?: boolean
}) {
  const s = surface ?? product.primarySurface
  const media = <ProductMedia product={product} surface={s} slot={slot} label={label} priority={priority} />
  if (s === 'mobile') return <PhoneFrame>{media}</PhoneFrame>
  return (
    <WindowFrame title={`${product.name}${label ? ` · ${label}` : ''}`} className={restricted ? 'zx-s-restricted' : ''}>
      {media}
      {restricted && (
        <>
          <span className="zx-s-hatch" aria-hidden="true" />
          <span className="zx-s-seal">Internal — detail withheld</span>
        </>
      )}
    </WindowFrame>
  )
}

/**
 * Depth stack — the flight's motion as a reusable component. Items sit one
 * behind another on the Z axis; choosing one brings it to the front while the
 * ones before it fly past the viewer. Pure CSS 3D, no WebGL.
 */
export function DepthStack<T>({
  items,
  active,
  surface = 'desktop',
  getKey,
  children,
}: {
  items: T[]
  active: number
  surface?: Surface
  getKey: (item: T, i: number) => string
  children: (item: T, i: number, front: boolean) => ReactNode
}) {
  const reduce = useReducedMotion()
  return (
    <div className="zx-ds" data-surface={surface}>
      {items.map((item, i) => {
        const d = i - active
        const front = d === 0
        const target = front ? { z: 0, y: 0, opacity: 1 } : d > 0 ? { z: -d * 420, y: -d * 104, opacity: Math.max(0, 1 - d * 0.36) } : { z: 520, y: 50, opacity: 0 }
        return (
          <motion.div
            key={getKey(item, i)}
            className="zx-ds-item"
            style={{ zIndex: 50 - Math.abs(d), pointerEvents: front ? 'auto' : 'none' }}
            initial={false}
            animate={target}
            transition={reduce ? { duration: 0 } : { duration: 0.85, ease: EASE }}
            aria-hidden={!front}
            inert={!front}
          >
            {children(item, i, front)}
          </motion.div>
        )
      })}
    </div>
  )
}

export function ZoomButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="zx-zoom-btn" onClick={onClick} aria-label="Open zoomable view">
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
        <circle cx="5" cy="5" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M8 8l3 3" stroke="currentColor" strokeWidth="1.2" />
      </svg>
      Zoom
    </button>
  )
}
