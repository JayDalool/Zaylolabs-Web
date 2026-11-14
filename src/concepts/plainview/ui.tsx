/**
 * Plain View — shared pieces: route base, product colour scope, small labels.
 * Rule of the concept: plain words only. No codes, no coordinates, no metaphors.
 */
import type { CSSProperties } from 'react'
import { products, type Product, type Surface } from '../../data/products'

export const PV = '/plain-view'
export const EASE = [0.2, 0.7, 0.2, 1] as const

/** Scopes a subtree to one product's colour: deep tone on paper, bright tone inside the case. */
export const hueVars = (p: Product): CSSProperties =>
  ({ '--hue': p.hue.ink, '--hue-bright': p.hue.bright, '--hue-wash': p.hue.wash }) as CSSProperties

const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']
/** "Five" for 5; falls back to digits past ten so the headline stays true as products are added. */
export const countWord = (n: number) => WORDS[n] ?? String(n)

const SURFACE_WORD: Record<Surface, string> = { desktop: 'Desktop', mobile: 'Phone' }
export const surfaceWord = (s: Surface) => SURFACE_WORD[s]
/** "Desktop and phone" — the kinds of screen a product is made for. */
export const runsOn = (p: Product) =>
  p.surfaces
    .map(surfaceWord)
    .map((w, i) => (i ? w.toLowerCase() : w))
    .join(' and ')

export const position = (p: Product) => `${products.indexOf(p) + 1} of ${products.length}`

/** Stage label. The marker's shape differs per stage, so it never relies on colour alone. */
export function StagePill({ product }: { product: Product }) {
  return (
    <span className="pv-pill" data-stage={product.stage}>
      <i aria-hidden="true" />
      {product.stageLabel}
    </span>
  )
}

export function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M3 8h9.5M8.5 3.5 13 8l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ZMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 6h14L5 18h14" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  )
}
