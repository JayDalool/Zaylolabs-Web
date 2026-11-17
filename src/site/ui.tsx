/** Specimen design-system primitives. Small, composable, no product knowledge. */
import { motion, useReducedMotion } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import type { Product } from '../data/products'

export const EASE = [0.2, 0.7, 0.2, 1] as const
/** Path prefix for site links. Empty: the site is served from the root. */
export const BASE = ''
export const HOME = '/'

/** Sets the product's colours for everything inside: its accents, and the field its sections take on. */
export function hueVars(p: Product): CSSProperties {
  return {
    '--h-ink': p.hue.ink,
    '--h-bright': p.hue.bright,
    '--h-wash': p.hue.wash,
    '--t-field': p.hue.field,
    '--t-on': p.hue.on,
  } as CSSProperties
}

export function ZMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M5 7.5h18L5 20.5h18" strokeLinejoin="miter" />
        <path d="M5 4.5v6M23 17.5v6" strokeWidth="1" />
      </g>
      <circle cx="23" cy="20.5" r="2.6" fill="var(--signal)" />
    </svg>
  )
}

export function Logo() {
  return (
    <Link className="sp-logo" to={HOME} aria-label="ZayloLabs — home" viewTransition>
      <ZMark />
      <span className="sp-logo-word">
        Zaylo<small>Labs</small>
      </span>
    </Link>
  )
}

export function Tag({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`sp-tag ${className}`}>{children}</span>
}

/** Stage is always shown with a text label plus a shape — never colour alone. */
export function StageBadge({ product }: { product: Product }) {
  return (
    <span className="sp-tag sp-stage" data-stage={product.stage}>
      {product.stageLabel}
    </span>
  )
}

export function Arrow({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M2 8h11M9 3.5 13.5 8 9 12.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
    </svg>
  )
}

export function ButtonLink({ children, ghost, ...rest }: LinkProps & { ghost?: boolean }) {
  return (
    <Link className={`sp-btn ${ghost ? 'sp-btn-ghost' : ''}`} viewTransition {...rest}>
      {children}
      <Arrow />
    </Link>
  )
}

export function Fig({ n, children }: { n: string; children: ReactNode }) {
  return (
    <figcaption className="sp-fig">
      <b>Fig. {n}</b>
      <span>{children}</span>
    </figcaption>
  )
}

/** Fade-and-rise on first view. Renders static when reduced motion is requested. */
export function Reveal({
  children,
  delay = 0,
  y = 22,
  className,
  style,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
  style?: CSSProperties
}) {
  const reduce = useReducedMotion()
  if (reduce)
    return (
      <div className={className} style={style}>
        {children}
      </div>
    )
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.8, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

export function FocusList({
  product,
  active,
  onActive,
}: {
  product: Product
  active?: number | null
  onActive?: (i: number | null) => void
}) {
  return (
    <ol className="sp-focus">
      {product.focus.map((f, i) => (
        <li
          key={f.title}
          className={active === i ? 'is-active' : ''}
          data-interactive={onActive ? '' : undefined}
          onMouseEnter={onActive ? () => onActive(i) : undefined}
          onMouseLeave={onActive ? () => onActive(null) : undefined}
        >
          <b>{f.title}</b>
          <span>{f.note}</span>
        </li>
      ))}
    </ol>
  )
}

export function SectionHead({ label, title, children }: { label: string; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="sp-grid" style={{ rowGap: '1.5rem', marginBottom: 'clamp(2rem, 5vw, 4rem)' }}>
      <p className="sp-mono sp-signal" style={{ gridColumn: '1 / -1', margin: 0 }}>
        {label}
      </p>
      <h2 className="sp-h2" style={{ gridColumn: '1 / span 12' }}>
        {title}
      </h2>
      {children && <div style={{ gridColumn: '1 / -1' }}>{children}</div>}
    </div>
  )
}
