import { products, type Product, type Surface } from '../../data/products'
import { realMedia } from '../../media/manifest'

/** Route prefix for every Z-Axis page. */
export const BASE = '/z-axis'

/** World units between stations along −Z. */
export const SPACING = 30
/** How far in front of the camera a station's windows sit when you are "at" it. */
export const STANDOFF = 9.5
export const FLOOR_Y = -2.35
export const VOLT = '#d8ff45'
export const BONE = '#eceee8'

export type PaneMode = 'full' | 'ghost' | 'restricted'

export interface PaneSpec {
  surface: Surface
  /** Capture slot (1-based) — ghost panes have no capture and ignore it. */
  slot: number
  /** Window width in world units; height follows the surface's aspect. */
  w: number
  /** Local position. +x points toward the centre of the corridor, −x outward. */
  pos: [number, number, number]
  rot?: [number, number, number]
  mode?: PaneMode
  /** Delays this pane's materialisation behind the station's primary pane (0–1). */
  delay?: number
}

export interface Station {
  kind: 'intro' | 'product' | 'end'
  id: string
  label: string
  /** −1 = windows on the left, +1 = right, 0 = centred. */
  side: -1 | 0 | 1
  hue: string
  product?: Product
  panes: PaneSpec[]
  /** GauzeMate's containment ring. */
  ring?: boolean
  placeholder: boolean
}

/** Each product gets its own arrangement — no two stations share a composition. */
const LAYOUTS: Record<string, { panes: PaneSpec[]; ring?: boolean }> = {
  // A subject window with its comparables scattered behind it, and the phone companion in front.
  samvisionai: {
    panes: [
      { surface: 'desktop', slot: 1, w: 5.7, pos: [0, 0.35, 0] },
      { surface: 'desktop', slot: 2, w: 3.3, pos: [-1.9, 2.2, -3.0], rot: [0, -0.12, 0.02], delay: 0.18 },
      { surface: 'desktop', slot: 3, w: 3.3, pos: [2.2, 2.55, -5.0], rot: [0, 0.1, -0.02], delay: 0.3 },
      { surface: 'mobile', slot: 1, w: 1.22, pos: [2.75, -0.72, 1.1], rot: [0, 0.22, 0], delay: 0.1 },
    ],
  },
  // Phone-first: a tall handset pair up front, the desktop view held back.
  myfamilyexpenses: {
    panes: [
      { surface: 'mobile', slot: 1, w: 2.0, pos: [0.55, 0.12, 0.5] },
      { surface: 'mobile', slot: 2, w: 1.36, pos: [2.5, -0.55, 1.5], rot: [0, 0.25, 0.04], delay: 0.14 },
      { surface: 'desktop', slot: 1, w: 4.4, pos: [-0.9, 1.45, -3.4], rot: [0, -0.08, 0], delay: 0.24 },
    ],
  },
  // An ordered cascade — one plane per layer of the system, receding like a week of pages.
  gyst: {
    panes: [
      { surface: 'desktop', slot: 1, w: 5.0, pos: [0.3, -0.15, 0.4], rot: [-0.06, 0, 0] },
      { surface: 'desktop', slot: 2, w: 5.0, pos: [-0.2, 0.42, -1.3], rot: [-0.06, 0, 0], delay: 0.1 },
      { surface: 'desktop', slot: 3, w: 5.0, pos: [-0.7, 0.99, -3.0], rot: [-0.06, 0, 0], delay: 0.2 },
      { surface: 'desktop', slot: 4, w: 5.0, pos: [-1.2, 1.56, -4.7], rot: [-0.06, 0, 0], delay: 0.3 },
      { surface: 'mobile', slot: 1, w: 1.05, pos: [3.05, -0.95, 1.5], rot: [0, 0.3, 0], delay: 0.16 },
    ],
  },
  // Internal: one hatched, never fully disclosed surface ringed by blank agent panes.
  commandcenter: {
    panes: [
      { surface: 'desktop', slot: 1, w: 5.5, pos: [0.45, 0.3, 0], mode: 'restricted' },
      { surface: 'desktop', slot: 0, w: 1.7, pos: [-1.5, 2.3, -2.2], mode: 'ghost', delay: 0.14 },
      { surface: 'desktop', slot: 0, w: 1.7, pos: [0.5, 2.3, -2.2], mode: 'ghost', delay: 0.2 },
      { surface: 'desktop', slot: 0, w: 1.7, pos: [2.5, 2.3, -2.2], mode: 'ghost', delay: 0.26 },
      { surface: 'desktop', slot: 0, w: 1.25, pos: [4.2, 1.15, -3.6], rot: [0, 0.3, 0], mode: 'ghost', delay: 0.1 },
      { surface: 'desktop', slot: 0, w: 1.25, pos: [4.2, 0.1, -3.6], rot: [0, 0.3, 0], mode: 'ghost', delay: 0.18 },
      { surface: 'desktop', slot: 0, w: 1.25, pos: [4.2, -0.95, -3.6], rot: [0, 0.3, 0], mode: 'ghost', delay: 0.26 },
    ],
  },
  // Experimental: a single small handset held inside a containment ring.
  gauzemate: {
    panes: [{ surface: 'mobile', slot: 1, w: 1.55, pos: [0, 0.1, 0] }],
    ring: true,
  },
}

const SIDES: (-1 | 1)[] = [-1, 1, -1, 1, -1]

export const stations: Station[] = [
  { kind: 'intro', id: 'origin', label: 'Origin', side: 0, hue: VOLT, panes: [], placeholder: false },
  ...products.map((product, i): Station => {
    const layout = LAYOUTS[product.slug] ?? {
      panes: [{ surface: product.primarySurface, slot: 1, w: product.primarySurface === 'desktop' ? 5.4 : 1.9, pos: [0, 0.3, 0] }],
    }
    return {
      kind: 'product',
      id: product.slug,
      label: product.name,
      side: SIDES[i % SIDES.length],
      hue: product.hue.bright,
      product,
      panes: layout.panes,
      ring: layout.ring,
      placeholder: layout.panes.some((p) => p.mode !== 'ghost' && !realMedia(product.slug, p.surface, p.slot)),
    }
  }),
  { kind: 'end', id: 'studio', label: 'Studio', side: 0, hue: VOLT, panes: [], placeholder: false },
]

export const COUNT = stations.length

/** Lateral offset of a station's window group from the corridor centre line. */
export const lateral = (narrow: boolean) => (narrow ? 0.0 : 3.25)

/** Shared flight state: written by the page's scroll loop, read by the WebGL scene. */
export const flight = {
  /** Smoothed position in station units (0 = origin, COUNT−1 = studio). */
  p: 0,
  /** Stations per second — drives streaks. */
  vel: 0,
  pointerX: 0,
  pointerY: 0,
}

/** Dwell easing: slow near each station, quick in between. */
export const plateau = (f: number) => f - Math.sin(2 * Math.PI * f) / (2 * Math.PI)

export const depthLabel = (p: number) => {
  const z = p * SPACING
  return `Z ${z < 0.005 ? ' ' : '−'}${z.toFixed(2).padStart(6, '0')}`
}
