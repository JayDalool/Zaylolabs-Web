import { useMemo, type CSSProperties, type ReactNode } from 'react'
import type { Motif, Product, Surface, Theme } from '../data/products'
import { realMedia } from './manifest'
import { schematicSvg, SIZE, type SchematicTone } from './schematic'
import './media.css'

export interface ProductMediaProps {
  product: Product
  surface?: Surface
  /** 1-based slot. Maps to the Nth file in the product's asset folder. */
  slot?: number
  /** Short description of what this slot will show, e.g. "Comparables". */
  label?: string
  tone?: SchematicTone
  className?: string
  style?: CSSProperties
  /** Show the capture from this theme's folder when the product has one. */
  theme?: Theme
  /** Eager-load above-the-fold captures. */
  priority?: boolean
}

/**
 * One capture slot. Renders the real screenshot when the asset folder has one,
 * otherwise a stamped placeholder schematic. Never invents interface imagery.
 */
export function ProductMedia({ product, surface, slot = 1, label, tone, className = '', style, priority, theme }: ProductMediaProps) {
  const s = surface ?? product.primarySurface
  const real = realMedia(product.slug, s, slot, theme)
  const svg = useMemo(
    () => (real ? '' : schematicSvg(product, s, { index: slot, tone, label })),
    [real, product, s, slot, tone, label],
  )
  const { w, h } = SIZE[s]

  if (real) {
    return (
      <img
        className={`zm-media ${className}`}
        style={{ aspectRatio: `${w} / ${h}`, ...style }}
        src={real}
        alt={`${product.name} — ${label ?? `${s} interface`}`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
      />
    )
  }
  return (
    <div
      className={`zm-media zm-placeholder ${className}`}
      style={{ aspectRatio: `${w} / ${h}`, ...style }}
      data-placeholder="true"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

/** Desktop application window chrome. Styled through --frame-* variables. */
export function WindowFrame({ title, children, className = '', style }: { title?: string; children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <figure className={`zm-window ${className}`} style={style}>
      <div className="zm-window-bar" aria-hidden="true">
        <span className="zm-dots">
          <i />
          <i />
          <i />
        </span>
        {title && <span className="zm-window-title">{title}</span>}
      </div>
      <div className="zm-window-body">{children}</div>
    </figure>
  )
}

/** Phone bezel. Styled through --frame-* variables. */
export function PhoneFrame({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <figure className={`zm-phone ${className}`} style={style}>
      <span className="zm-phone-island" aria-hidden="true" />
      <div className="zm-phone-body">{children}</div>
    </figure>
  )
}

/** Small line glyph for each product, drawn from the same motif as its schematic. */
export function ProductGlyph({ motif, size = 24, className = '' }: { motif: Motif; size?: number; className?: string }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {motif === 'parcel' && (
        <g {...common}>
          <path d="M3 8.5 10 4l11 3.5-2.5 11L8 20.5 3 8.5Z" />
          <path d="M10 4 12.5 12 8 20.5M12.5 12l6-0" />
          <circle cx="15.5" cy="15.5" r="1.4" fill="currentColor" stroke="none" />
        </g>
      )}
      {motif === 'ledger' && (
        <g {...common}>
          <path d="M6 3h12v17l-2-1.6-2 1.6-2-1.6-2 1.6-2-1.6L6 20V3Z" />
          <path d="M9 8h6M9 11.5h6M9 15h3" />
        </g>
      )}
      {motif === 'weekgrid' && (
        <g {...common}>
          <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
          <path d="M3.5 9h17M9.2 9v10.5M14.8 9v10.5" />
          <rect x="10.6" y="11" width="2.8" height="5" rx=".6" fill="currentColor" stroke="none" />
        </g>
      )}
      {motif === 'pipeline' && (
        <g {...common}>
          <rect x="2.5" y="9.5" width="5" height="5" rx="1" />
          <rect x="16.5" y="3.5" width="5" height="5" rx="1" />
          <rect x="16.5" y="15.5" width="5" height="5" rx="1" fill="currentColor" />
          <path d="M7.5 12c4 0 4-6 9-6M7.5 12c4 0 4 6 9 6" />
        </g>
      )}
    </svg>
  )
}
