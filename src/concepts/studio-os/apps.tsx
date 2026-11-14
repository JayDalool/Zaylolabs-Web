import type { ReactNode } from 'react'
import { products, type Product } from '../../data/products'
import { ProductGlyph } from '../../media/ProductMedia'

export interface AppDef {
  id: string
  /** Window title. */
  title: string
  kind: 'product' | 'system'
  product?: Product
  /** Preferred window size on the desktop shell; clamped to the viewport. */
  w: number
  h: number
  /** Dark chrome for the terminal-styled window. */
  dark?: boolean
  /** One line used by the command palette and dock tooltip. */
  hint: string
}

const productSize: Record<string, { w: number; h: number; dark?: boolean }> = {
  samvisionai: { w: 820, h: 548 },
  myfamilyexpenses: { w: 600, h: 610 },
  gyst: { w: 680, h: 540 },
  commandcenter: { w: 640, h: 452, dark: true },
  gauzemate: { w: 348, h: 478 },
}

export const apps: AppDef[] = [
  ...products.map(
    (p): AppDef => ({
      id: p.slug,
      title: p.alias ? `${p.name} / ${p.alias}` : p.name,
      kind: 'product',
      product: p,
      hint: `${p.discipline} · ${p.stageLabel}`,
      ...(productSize[p.slug] ?? { w: 640, h: 480 }),
    }),
  ),
  { id: 'readme', title: 'Read me', kind: 'system', w: 408, h: 530, hint: 'What this studio is' },
  { id: 'status', title: 'Status', kind: 'system', w: 548, h: 430, hint: 'Every project and its honest stage' },
  { id: 'contact', title: 'Contact', kind: 'system', w: 392, h: 318, hint: 'zaylolabs.com' },
  { id: 'about', title: 'About this build', kind: 'system', w: 420, h: 408, hint: 'Prototype notes and shortcuts' },
]

export const appById = (id: string) => apps.find((a) => a.id === id)!

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

const systemGlyph: Record<string, ReactNode> = {
  readme: (
    <g {...stroke}>
      <path d="M6.5 3.5h8l3 3v14h-11v-17Z" />
      <path d="M14.5 3.5v3h3M9 11h6M9 14h6M9 17h3.5" />
    </g>
  ),
  status: (
    <g {...stroke}>
      <path d="M9.5 6.5h10M9.5 12h10M9.5 17.5h10" />
      <circle cx="5.2" cy="6.5" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="5.2" cy="12" r="1.3" />
      <circle cx="5.2" cy="17.5" r="1.3" />
    </g>
  ),
  contact: (
    <g {...stroke}>
      <rect x="3.5" y="6" width="17" height="12" rx="2" />
      <path d="m4 7.5 8 6 8-6" />
    </g>
  ),
  about: (
    <g {...stroke}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5" />
      <circle cx="12" cy="7.8" r="1" fill="currentColor" stroke="none" />
    </g>
  ),
}

export function AppGlyph({ app, size = 22 }: { app: AppDef; size?: number }) {
  if (app.product) return <ProductGlyph motif={app.product.motif} size={size} />
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {systemGlyph[app.id]}
    </svg>
  )
}

export function ZMark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d="M7 8.5h18L7 23.5h18" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="square" />
    </svg>
  )
}
