import type { Product, Surface } from '../../data/products'
import type { SchematicTone } from '../../media/schematic'

/** The four layers of an exploded specimen, bottom to top. */
export const LAYERS = [
  { id: 'L0', name: 'Grid', note: 'substrate' },
  { id: 'L1', name: 'Structure', note: 'layout diagram' },
  { id: 'L2', name: 'Interface', note: 'capture' },
  { id: 'L3', name: 'Notes', note: 'annotations' },
] as const

export interface Pin {
  /** 0–1 from the left / top of the capture. */
  x: number
  y: number
}

export const paperTone = (p: Product): SchematicTone => ({
  paper: '#f8f5ee',
  ink: '#15140f',
  line: 'rgba(21,20,15,.22)',
  accent: p.hue.ink,
})

/** L1 — a neutral layout diagram. Explicitly a diagram, never presented as a capture. */
export function structureSvg(surface: Surface, tone = { paper: '#f8f5ee', ink: '#15140f' }): string {
  const desktop = surface === 'desktop'
  const w = desktop ? 1600 : 400
  const h = desktop ? 1000 : 860
  const s = desktop ? 3 : 2
  const box = (x: number, y: number, bw: number, bh: number, cross = false) =>
    `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="${desktop ? 10 : 6}"/>` +
    (cross ? `<path d="M${x} ${y} L${x + bw} ${y + bh} M${x + bw} ${y} L${x} ${y + bh}" opacity=".35"/>` : '')
  const body = desktop
    ? box(40, 40, 1520, 90) +
      box(40, 160, 300, 800) +
      box(370, 160, 760, 470, true) +
      box(1160, 160, 400, 220) +
      box(1160, 410, 400, 220) +
      box(370, 660, 370, 300) +
      box(770, 660, 360, 300) +
      box(1160, 660, 400, 300, true)
    : box(24, 24, 352, 70) + box(24, 116, 352, 250, true) + box(24, 388, 166, 150) + box(210, 388, 166, 150) + box(24, 560, 352, 190) + box(24, 772, 352, 64)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${tone.paper}"/><g fill="none" stroke="${tone.ink}" stroke-width="${s}" stroke-dasharray="${s * 4} ${s * 3}">${body}</g></svg>`
}

export const structureDataUrl = (surface: Surface) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(structureSvg(surface))}`
