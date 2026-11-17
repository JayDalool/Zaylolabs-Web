/**
 * Placeholder schematics.
 *
 * When a product has no real capture in src/assets/products/<slug>/…, the media
 * system draws one of these instead. They are deliberately diagrams, not fake
 * interfaces, and every one carries a visible PLACEHOLDER stamp — a fictional
 * mockup must never be mistaken for a genuine product screenshot.
 *
 * Output is a plain SVG string, inlined in the DOM.
 */
import type { Motif, Product, Surface } from '../data/products'

export interface SchematicTone {
  paper: string
  ink: string
  line: string
  accent: string
}

/** Default tone reads CSS variables so each concept can recolour placeholders. */
export const cssTone: SchematicTone = {
  paper: 'var(--sch-paper, #f1ede3)',
  ink: 'var(--sch-ink, #1a1915)',
  line: 'var(--sch-line, rgba(26,25,21,.28))',
  accent: 'var(--sch-accent, #e8431c)',
}

export const SIZE: Record<Surface, { w: number; h: number }> = {
  desktop: { w: 1600, h: 1000 },
  mobile: { w: 400, h: 860 },
}

function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

function hash(str: string) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619)
  return h >>> 0
}

const n = (v: number) => Math.round(v * 10) / 10

interface Box {
  x: number
  y: number
  w: number
  h: number
}

type Draw = (b: Box, r: () => number) => string

/* —— Motifs. Classes: l = hairline, i = ink stroke, a = accent stroke,
      af = accent fill, as = soft accent fill, d = dashed accent. —— */

const parcel: Draw = (b, r) => {
  const cols = b.w > b.h ? 8 : 4
  const rows = b.w > b.h ? 5 : 7
  const pts: { x: number; y: number }[][] = []
  for (let j = 0; j <= rows; j++) {
    pts.push([])
    for (let i = 0; i <= cols; i++) {
      const edge = i === 0 || j === 0 || i === cols || j === rows
      const jx = edge ? 0 : (r() - 0.5) * (b.w / cols) * 0.42
      const jy = edge ? 0 : (r() - 0.5) * (b.h / rows) * 0.42
      pts[j].push({ x: b.x + (i / cols) * b.w + jx, y: b.y + (j / rows) * b.h + jy })
    }
  }
  const lot = (i: number, j: number) => [pts[j][i], pts[j][i + 1], pts[j + 1][i + 1], pts[j + 1][i]]
  const centre = (q: { x: number; y: number }[]) => ({
    x: q.reduce((s, p) => s + p.x, 0) / 4,
    y: q.reduce((s, p) => s + p.y, 0) / 4,
  })
  const poly = (q: { x: number; y: number }[], cls: string) =>
    `<polygon class="${cls}" points="${q.map((p) => `${n(p.x)},${n(p.y)}`).join(' ')}"/>`
  let out = ''
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) out += poly(lot(i, j), 'l')
  const si = Math.floor(cols / 2)
  const sj = Math.floor(rows / 2)
  const subject = lot(si, sj)
  const comps = [
    [si - 2, sj - 1],
    [si + 2, sj - 2 < 0 ? 0 : sj - 2],
    [si + 1, sj + 1],
  ].map(([i, j]) => lot(Math.max(0, Math.min(cols - 1, i)), Math.max(0, Math.min(rows - 1, j))))
  const c0 = centre(subject)
  for (const c of comps) {
    const cc = centre(c)
    out += poly(c, 'as')
    out += `<line class="d" x1="${n(c0.x)}" y1="${n(c0.y)}" x2="${n(cc.x)}" y2="${n(cc.y)}"/>`
    out += `<circle class="a" cx="${n(cc.x)}" cy="${n(cc.y)}" r="${n(b.w * 0.008 + 4)}"/>`
  }
  out += poly(subject, 'af')
  // contour lines
  for (let k = 0; k < 3; k++) {
    const y0 = b.y + b.h * (0.2 + k * 0.28)
    out += `<path class="i" d="M${n(b.x)} ${n(y0)} C ${n(b.x + b.w * 0.3)} ${n(y0 - b.h * 0.16)}, ${n(
      b.x + b.w * 0.62,
    )} ${n(y0 + b.h * 0.2)}, ${n(b.x + b.w)} ${n(y0 - b.h * 0.05)}" opacity=".35"/>`
  }
  // compass
  const cr = Math.min(b.w, b.h) * 0.06
  const cx = b.x + b.w - cr * 1.6
  const cy = b.y + cr * 1.6
  out += `<circle class="i" cx="${n(cx)}" cy="${n(cy)}" r="${n(cr)}"/><path class="i" d="M${n(cx)} ${n(
    cy + cr * 0.6,
  )} L${n(cx)} ${n(cy - cr * 1.5)} M${n(cx - cr * 0.3)} ${n(cy - cr * 1.05)} L${n(cx)} ${n(cy - cr * 1.5)} L${n(
    cx + cr * 0.3,
  )} ${n(cy - cr * 1.05)}"/>`
  return out
}

const ledger: Draw = (b, r) => {
  let out = ''
  const wide = b.w > b.h
  const rowH = wide ? b.h / 12 : b.h / 16
  const stripW = wide ? b.w * 0.2 : b.w * 0.36
  const tableW = b.w - stripW - b.w * 0.06
  const rowsN = Math.floor(b.h / rowH)
  for (let j = 0; j <= rowsN; j++)
    out += `<line class="l" x1="${n(b.x)}" y1="${n(b.y + j * rowH)}" x2="${n(b.x + tableW)}" y2="${n(b.y + j * rowH)}"/>`
  for (const f of [0, 0.12, 0.72, 1])
    out += `<line class="l" x1="${n(b.x + tableW * f)}" y1="${n(b.y)}" x2="${n(b.x + tableW * f)}" y2="${n(
      b.y + rowsN * rowH,
    )}"/>`
  const anchors: { x: number; y: number }[] = []
  for (let j = 1; j < rowsN; j++) {
    const y = b.y + j * rowH + rowH * 0.36
    const bh = rowH * 0.28
    const w1 = tableW * (0.18 + r() * 0.34)
    const hot = j % 4 === 2
    out += `<rect class="${hot ? 'af' : 'ib'}" x="${n(b.x + tableW * 0.15)}" y="${n(y)}" width="${n(w1)}" height="${n(
      bh,
    )}" rx="${n(bh / 2)}"/>`
    out += `<rect class="ib" x="${n(b.x + tableW * 0.76)}" y="${n(y)}" width="${n(
      tableW * (0.08 + r() * 0.12),
    )}" height="${n(bh)}" rx="${n(bh / 2)}" opacity=".55"/>`
    out += `<circle class="${hot ? 'af' : 'i'}" cx="${n(b.x + tableW * 0.06)}" cy="${n(y + bh / 2)}" r="${n(bh * 0.7)}"/>`
    if (hot) anchors.push({ x: b.x + tableW, y: y + bh / 2 })
  }
  // receipt strip
  const sx = b.x + b.w - stripW
  const sy = b.y + b.h * 0.04
  const sh = b.h * 0.86
  const teeth = 9
  let d = `M${n(sx)} ${n(sy)} H${n(sx + stripW)} V${n(sy + sh)}`
  for (let t = teeth; t > 0; t--) {
    const x1 = sx + (stripW * (t - 0.5)) / teeth
    const x2 = sx + (stripW * (t - 1)) / teeth
    d += ` L${n(x1)} ${n(sy + sh + stripW * 0.05)} L${n(x2)} ${n(sy + sh)}`
  }
  out += `<path class="ip" d="${d} Z"/>`
  for (let k = 0; k < 9; k++) {
    const y = sy + sh * (0.08 + k * 0.09)
    out += `<rect class="ib" x="${n(sx + stripW * 0.12)}" y="${n(y)}" width="${n(
      stripW * (0.3 + r() * 0.3),
    )}" height="${n(rowH * 0.18)}" rx="2" opacity=".6"/>`
    out += `<rect class="ib" x="${n(sx + stripW * 0.72)}" y="${n(y)}" width="${n(stripW * 0.16)}" height="${n(
      rowH * 0.18,
    )}" rx="2" opacity=".6"/>`
  }
  out += `<rect class="af" x="${n(sx + stripW * 0.12)}" y="${n(sy + sh * 0.9)}" width="${n(stripW * 0.76)}" height="${n(
    rowH * 0.3,
  )}" rx="3"/>`
  for (const a of anchors) {
    out += `<path class="d" d="M${n(a.x)} ${n(a.y)} C ${n(a.x + b.w * 0.03)} ${n(a.y)}, ${n(sx - b.w * 0.03)} ${n(
      sy + sh * 0.5,
    )}, ${n(sx)} ${n(sy + sh * 0.5)}"/>`
  }
  return out
}

const weekgrid: Draw = (b, r) => {
  let out = ''
  const wide = b.w > b.h
  const railW = wide ? b.w * 0.2 : 0
  const gx = b.x + railW + (wide ? b.w * 0.04 : 0)
  const gw = b.w - (gx - b.x)
  const head = b.h * 0.08
  const cw = gw / 7
  for (let i = 0; i <= 7; i++)
    out += `<line class="l" x1="${n(gx + i * cw)}" y1="${n(b.y)}" x2="${n(gx + i * cw)}" y2="${n(b.y + b.h)}"/>`
  out += `<line class="i" x1="${n(gx)}" y1="${n(b.y + head)}" x2="${n(gx + gw)}" y2="${n(b.y + head)}"/>`
  const slots = wide ? 9 : 14
  const sh = (b.h - head) / slots
  for (let j = 1; j < slots; j++)
    out += `<line class="l" x1="${n(gx)}" y1="${n(b.y + head + j * sh)}" x2="${n(gx + gw)}" y2="${n(
      b.y + head + j * sh,
    )}" opacity=".5"/>`
  for (let i = 0; i < 7; i++) {
    out += `<circle class="${i === 2 ? 'af' : 'i'}" cx="${n(gx + (i + 0.5) * cw)}" cy="${n(b.y + head / 2)}" r="${n(
      Math.min(cw, head) * 0.16,
    )}"/>`
    let j = Math.floor(r() * 2)
    while (j < slots - 1) {
      const span = 1 + Math.floor(r() * 2.4)
      const routine = j === 1 || (i + j) % 5 === 0
      const pad = cw * 0.08
      out += `<rect class="${routine ? 'af' : (i + j) % 3 === 0 ? 'as' : 'ip'}" x="${n(gx + i * cw + pad)}" y="${n(
        b.y + head + j * sh + pad * 0.6,
      )}" width="${n(cw - pad * 2)}" height="${n(Math.min(span, slots - j) * sh - pad * 1.2)}" rx="${n(cw * 0.06)}"/>`
      j += span + Math.floor(r() * 2.2)
    }
  }
  if (wide) {
    for (let k = 0; k < 7; k++) {
      const y = b.y + head + k * (b.h * 0.085)
      const done = k < 3
      const s = b.h * 0.032
      out += `<rect class="${done ? 'af' : 'i'}" x="${n(b.x)}" y="${n(y)}" width="${n(s)}" height="${n(s)}" rx="3"/>`
      out += `<rect class="ib" x="${n(b.x + s * 1.8)}" y="${n(y + s * 0.3)}" width="${n(
        railW * (0.35 + r() * 0.4),
      )}" height="${n(s * 0.4)}" rx="2" opacity="${done ? 0.35 : 0.75}"/>`
    }
    const lr = b.h * 0.085
    const lx = b.x + railW * 0.42
    const ly = b.y + b.h - lr * 1.5
    out += `<circle class="a" cx="${n(lx)}" cy="${n(ly)}" r="${n(lr)}" stroke-dasharray="${n(lr * 4.6)} ${n(
      lr * 1.7,
    )}"/><circle class="l" cx="${n(lx)}" cy="${n(ly)}" r="${n(lr * 0.6)}"/><circle class="af" cx="${n(lx + lr)}" cy="${n(
      ly,
    )}" r="${n(lr * 0.14)}"/>`
  }
  return out
}

const pipeline: Draw = (b, r) => {
  let out = ''
  const wide = b.w > b.h
  const stagesN = wide ? 6 : 5
  const pos = (s: number, k: number, of: number) =>
    wide
      ? { x: b.x + ((s + 0.5) / stagesN) * b.w, y: b.y + ((k + 1) / (of + 1)) * b.h }
      : { x: b.x + ((k + 1) / (of + 1)) * b.w, y: b.y + ((s + 0.5) / stagesN) * b.h }
  const counts = [1, 3, 2, 1, 3, 1].slice(0, stagesN)
  const size = Math.min(b.w, b.h) * (wide ? 0.055 : 0.07)
  const layers = counts.map((c, s) => Array.from({ length: c }, (_, k) => pos(s, k, c)))
  for (let s = 0; s < stagesN; s++) {
    const a = wide ? b.x + (s / stagesN) * b.w : b.y + (s / stagesN) * b.h
    out += wide
      ? `<line class="l" x1="${n(a)}" y1="${n(b.y)}" x2="${n(a)}" y2="${n(b.y + b.h)}" stroke-dasharray="3 9"/>`
      : `<line class="l" x1="${n(b.x)}" y1="${n(a)}" x2="${n(b.x + b.w)}" y2="${n(a)}" stroke-dasharray="3 9"/>`
  }
  for (let s = 0; s < stagesN - 1; s++) {
    for (const p of layers[s]) {
      for (const q of layers[s + 1]) {
        if (layers[s].length > 1 && layers[s + 1].length > 1 && r() > 0.55) continue
        const live = r() > 0.6
        const m = wide ? (p.x + q.x) / 2 : (p.y + q.y) / 2
        const d = wide
          ? `M${n(p.x)} ${n(p.y)} C ${n(m)} ${n(p.y)}, ${n(m)} ${n(q.y)}, ${n(q.x)} ${n(q.y)}`
          : `M${n(p.x)} ${n(p.y)} C ${n(p.x)} ${n(m)}, ${n(q.x)} ${n(m)}, ${n(q.x)} ${n(q.y)}`
        out += `<path class="${live ? 'a' : 'i'}" d="${d}" opacity="${live ? 1 : 0.45}"/>`
      }
    }
  }
  layers.forEach((layer, s) => {
    for (const p of layer) {
      if (s === 3) {
        // approval gate
        out += `<rect class="ap" x="${n(p.x - size)}" y="${n(p.y - size)}" width="${n(size * 2)}" height="${n(
          size * 2,
        )}" transform="rotate(45 ${n(p.x)} ${n(p.y)})"/><path class="a" d="M${n(p.x - size * 0.4)} ${n(p.y)} l${n(
          size * 0.28,
        )} ${n(size * 0.3)} l${n(size * 0.5)} ${n(-size * 0.62)}"/>`
      } else {
        const hot = (s + Math.floor(r() * 3)) % 3 === 0
        out += `<rect class="${hot ? 'af' : 'ip'}" x="${n(p.x - size)}" y="${n(p.y - size * 0.62)}" width="${n(
          size * 2,
        )}" height="${n(size * 1.24)}" rx="${n(size * 0.22)}"/>`
        out += `<rect class="${hot ? 'pb' : 'ib'}" x="${n(p.x - size * 0.6)}" y="${n(p.y - size * 0.1)}" width="${n(
          size * (0.6 + r() * 0.5),
        )}" height="${n(size * 0.2)}" rx="2" opacity=".7"/>`
      }
    }
  })
  return out
}

const MOTIFS: Record<Motif, Draw> = { parcel, ledger, weekgrid, pipeline }

export interface SchematicOptions {
  /** 1-based slot number, shown on the plate and used as a seed. */
  index?: number
  tone?: SchematicTone
  /** Hide the stamp only when the surrounding UI already labels the placeholder. */
  stamp?: boolean
  /** Short slot label, e.g. "comparables". */
  label?: string
}

export function schematicSvg(product: Product, surface: Surface, opts: SchematicOptions = {}): string {
  const { index = 1, tone = cssTone, stamp = true, label } = opts
  const { w, h } = SIZE[surface]
  const id = `zs${hash(product.slug + surface + index + tone.paper + tone.accent).toString(36)}`
  const r = rng(hash(product.slug + surface) + index * 7919)
  const m = surface === 'desktop' ? 72 : 30
  const top = surface === 'desktop' ? 120 : 92
  const bottom = surface === 'desktop' ? 130 : 132
  const box: Box = { x: m, y: top, w: w - m * 2, h: h - top - bottom }
  const fs = surface === 'desktop' ? 19 : 12.5
  const sw = surface === 'desktop' ? 2 : 1.4
  const slot = `${surface}-${String(index).padStart(2, '0')}`
  const mark = (x: number, y: number) =>
    `<path class="l" d="M${x - 12} ${y} H${x + 12} M${x} ${y - 12} V${y + 12}"/><circle class="l" cx="${x}" cy="${y}" r="5"/>`

  return `<svg xmlns="http://www.w3.org/2000/svg" id="${id}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Placeholder schematic — a real ${product.name} ${surface} capture has not been added yet">
<style>
#${id} .bg{fill:${tone.paper}}
#${id} .l{fill:none;stroke:${tone.line};stroke-width:${sw * 0.6}}
#${id} .i{fill:none;stroke:${tone.ink};stroke-width:${sw};stroke-linecap:round;stroke-linejoin:round}
#${id} .ip{fill:${tone.paper};stroke:${tone.ink};stroke-width:${sw};stroke-linejoin:round}
#${id} .ib{fill:${tone.ink}}
#${id} .pb{fill:${tone.paper}}
#${id} .a{fill:none;stroke:${tone.accent};stroke-width:${sw * 1.15};stroke-linecap:round;stroke-linejoin:round}
#${id} .ap{fill:${tone.paper};stroke:${tone.accent};stroke-width:${sw * 1.15}}
#${id} .af{fill:${tone.accent}}
#${id} .as{fill:${tone.accent};opacity:.26}
#${id} .d{fill:none;stroke:${tone.accent};stroke-width:${sw * 0.9};stroke-dasharray:${sw * 3} ${sw * 4}}
#${id} text{font-family:var(--sch-font, ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace);font-size:${fs}px;letter-spacing:.08em;fill:${tone.ink}}
#${id} .t2{opacity:.6}
#${id} .ta{fill:${tone.accent}}
</style>
<rect class="bg" width="${w}" height="${h}"/>
${mark(m / 2, m / 2)}${mark(w - m / 2, m / 2)}${mark(m / 2, h - m / 2)}${mark(w - m / 2, h - m / 2)}
<text x="${m}" y="${top - fs * 2.3}">${product.catalog} · ${product.name.toUpperCase()}</text>
<text class="t2" x="${m}" y="${top - fs * 0.9}">${(label ?? product.discipline).toUpperCase()}</text>
<text class="t2" x="${w - m}" y="${top - fs * 2.3}" text-anchor="end">${slot.toUpperCase()}</text>
<g>${MOTIFS[product.motif](box, r)}</g>
<rect class="l" x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}"/>
${
  stamp
    ? `<g transform="translate(${m} ${h - bottom + (surface === 'desktop' ? 34 : 30)})">
<rect class="a" x="0" y="0" width="${surface === 'desktop' ? 236 : 150}" height="${fs * 2.3}" rx="${fs * 0.3}"/>
<text class="ta" x="${fs * 0.8}" y="${fs * 1.52}" font-weight="600">PLACEHOLDER</text>
<text class="t2" x="${surface === 'desktop' ? 262 : 0}" y="${surface === 'desktop' ? fs * 1.0 : fs * 3.9}">SCHEMATIC — NOT A PRODUCT SCREENSHOT</text>
<text class="t2" x="${surface === 'desktop' ? 262 : 0}" y="${surface === 'desktop' ? fs * 2.3 : fs * 5.3}">${surface === 'desktop' ? 'REAL CAPTURE PENDING · ' : 'PENDING · '}${product.slug}/${surface}/</text>
</g>`
    : ''
}
</svg>`
}

/** Explicit colours are required here — CSS variables do not resolve inside an image. */
