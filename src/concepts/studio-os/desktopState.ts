import { appById, type AppDef } from './apps'

export const MENU_H = 34
/** Left gutter reserved for the vertical dock. */
export const DOCK_W = 96

export interface Win {
  id: string
  x: number
  y: number
  z: number
  min: boolean
  max: boolean
  /** Opened by the initial composition rather than by the visitor (does not steal focus). */
  auto?: boolean
}

export interface DeskState {
  wins: Win[]
  top: number
}

export interface Viewport {
  w: number
  h: number
}

export type Action =
  | { type: 'open'; id: string; vp: Viewport }
  | { type: 'close'; id: string }
  | { type: 'minimise'; id: string }
  | { type: 'focus'; id: string }
  | { type: 'move'; id: string; x: number; y: number }
  | { type: 'toggleMax'; id: string }
  | { type: 'tidy'; vp: Viewport }
  | { type: 'cascade'; vp: Viewport }
  | { type: 'closeAll' }
  | { type: 'reset'; vp: Viewport }
  | { type: 'clamp'; vp: Viewport }

export function sizeOf(app: AppDef, vp: Viewport) {
  return { w: Math.min(app.w, vp.w - DOCK_W - 20), h: Math.min(app.h, vp.h - MENU_H - 76) }
}

export function maxRect(vp: Viewport) {
  return { x: DOCK_W, y: 12, w: vp.w - DOCK_W - 14, h: vp.h - MENU_H - 76 }
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

/** The designed first impression: three windows composed around the wallpaper wordmark. */
export function initialState(vp: Viewport): DeskState {
  const deskH = vp.h - MENU_H
  const sam = sizeOf(appById('samvisionai'), vp)
  const readme = sizeOf(appById('readme'), vp)
  const wins: Win[] = []
  if (vp.w >= 1340) {
    // Wide: read me left, flagship right, the internal terminal peeking out beneath it.
    const cc = sizeOf(appById('commandcenter'), vp)
    const off = Math.max(0, (vp.w - 1440) / 2)
    const samX = clamp(vp.w - sam.w - 84 - off, DOCK_W + readme.w + 28, vp.w - sam.w - 16)
    wins.push({ id: 'readme', x: DOCK_W + 14 + off, y: 30, z: 1, min: false, max: false, auto: true })
    wins.push({ id: 'commandcenter', x: clamp(samX + sam.w - cc.w + 60, DOCK_W, vp.w - cc.w - 12), y: clamp(deskH - cc.h - 44, 20, 46 + sam.h - 190), z: 2, min: false, max: false, auto: true })
    wins.push({ id: 'samvisionai', x: samX, y: 46, z: 3, min: false, max: false, auto: true })
  } else {
    // Tablet / small laptop: stack on the diagonal.
    const tall = deskH >= 900
    const gauze = sizeOf(appById('gauzemate'), vp)
    const samY = tall ? clamp(readme.h - 60, 120, deskH - sam.h - 130) : clamp(deskH - sam.h - 56, 60, 200)
    wins.push({ id: 'readme', x: DOCK_W + 6, y: 26, z: 1, min: false, max: false, auto: true })
    if (tall) wins.push({ id: 'gauzemate', x: clamp(vp.w - gauze.w - 22, DOCK_W, 9999), y: 44, z: 2, min: false, max: false, auto: true })
    wins.push({ id: 'samvisionai', x: clamp(vp.w - sam.w - 14, DOCK_W + 4, 9999), y: samY, z: 3, min: false, max: false, auto: true })
  }
  return { wins, top: 3 }
}

/** Finds a free-ish spot for a newly opened window: staggered from the dock edge. */
function spawnPoint(app: AppDef, state: DeskState, vp: Viewport) {
  const s = sizeOf(app, vp)
  const deskH = vp.h - MENU_H
  const n = state.wins.filter((w) => !w.min).length
  const baseX = DOCK_W + 40 + ((n * 44) % 260)
  const baseY = 30 + ((n * 34) % 170)
  const cx = (vp.w - DOCK_W - s.w) / 2 + DOCK_W
  return {
    x: clamp(app.kind === 'system' ? baseX : cx - 60 + ((n * 44) % 180), DOCK_W - 8, Math.max(DOCK_W - 8, vp.w - s.w - 12)),
    y: clamp(baseY, 12, Math.max(12, deskH - s.h - 60)),
  }
}

export function reducer(state: DeskState, a: Action): DeskState {
  switch (a.type) {
    case 'open': {
      const top = state.top + 1
      const existing = state.wins.find((w) => w.id === a.id)
      if (existing) return { top, wins: state.wins.map((w) => (w.id === a.id ? { ...w, min: false, z: top } : w)) }
      const p = spawnPoint(appById(a.id), state, a.vp)
      return { top, wins: [...state.wins, { id: a.id, ...p, z: top, min: false, max: false }] }
    }
    case 'close':
      return { ...state, wins: state.wins.filter((w) => w.id !== a.id) }
    case 'minimise':
      return { ...state, wins: state.wins.map((w) => (w.id === a.id ? { ...w, min: true } : w)) }
    case 'focus': {
      const w = state.wins.find((x) => x.id === a.id)
      if (!w || (w.z === state.top && !w.min)) return state
      const top = state.top + 1
      return { top, wins: state.wins.map((x) => (x.id === a.id ? { ...x, z: top } : x)) }
    }
    case 'move':
      return { ...state, wins: state.wins.map((w) => (w.id === a.id ? { ...w, x: a.x, y: a.y } : w)) }
    case 'toggleMax': {
      const top = state.top + 1
      return { top, wins: state.wins.map((w) => (w.id === a.id ? { ...w, max: !w.max, z: top } : w)) }
    }
    case 'tidy': {
      const vis = state.wins.filter((w) => !w.min)
      if (!vis.length) return state
      const deskH = a.vp.h - MENU_H
      const left = DOCK_W + 8
      const availW = a.vp.w - left - 12
      const availH = deskH - 20 - 64
      const placed = new Map<string, { x: number; y: number }>()
      // 1) Try to lay everything out side by side, tallest first, in rows.
      const gap = 18
      const byHeight = [...vis].sort((p, q) => sizeOf(appById(q.id), a.vp).h - sizeOf(appById(p.id), a.vp).h)
      let x = left
      let y = 20
      let rowH = 0
      let fits = true
      for (const w of byHeight) {
        const s = sizeOf(appById(w.id), a.vp)
        if (x + s.w > left + availW && x > left) {
          x = left
          y += rowH + gap
          rowH = 0
        }
        if (y + s.h > 20 + availH || s.w > availW) fits = false
        placed.set(w.id, { x, y })
        x += s.w + gap
        rowH = Math.max(rowH, s.h)
      }
      // 2) Otherwise fan them across the desk so every title bar stays visible.
      if (!fits) {
        placed.clear()
        const order = [...vis].sort((p, q) => p.z - q.z)
        const maxW = Math.max(...order.map((w) => sizeOf(appById(w.id), a.vp).w))
        const maxH = Math.max(...order.map((w) => sizeOf(appById(w.id), a.vp).h))
        const n = Math.max(1, order.length - 1)
        const dx = Math.max(0, availW - maxW) / n
        const dy = Math.min(46, Math.max(0, availH - maxH) / n)
        order.forEach((w, i) => {
          const s = sizeOf(appById(w.id), a.vp)
          placed.set(w.id, { x: Math.min(left + i * dx, left + availW - s.w), y: 20 + i * dy })
        })
      }
      return { ...state, wins: state.wins.map((w) => (placed.has(w.id) ? { ...w, ...placed.get(w.id)!, max: false } : w)) }
    }
    case 'cascade': {
      const vis = [...state.wins].filter((w) => !w.min).sort((p, q) => p.z - q.z)
      const deskH = a.vp.h - MENU_H
      const placed = new Map<string, { x: number; y: number }>()
      vis.forEach((w, i) => {
        const s = sizeOf(appById(w.id), a.vp)
        placed.set(w.id, {
          x: Math.min(DOCK_W + 14 + i * 40, Math.max(DOCK_W, a.vp.w - s.w - 12)),
          y: Math.min(22 + i * 38, Math.max(12, deskH - s.h - 16)),
        })
      })
      return { ...state, wins: state.wins.map((w) => (placed.has(w.id) ? { ...w, ...placed.get(w.id)!, max: false } : w)) }
    }
    case 'closeAll':
      return { ...state, wins: [] }
    case 'reset':
      return initialState(a.vp)
    case 'clamp': {
      const deskH = a.vp.h - MENU_H
      let changed = false
      const wins = state.wins.map((w) => {
        const s = sizeOf(appById(w.id), a.vp)
        const x = clamp(w.x, DOCK_W - 12, Math.max(DOCK_W - 12, a.vp.w - s.w))
        const y = clamp(w.y, 0, Math.max(0, deskH - s.h))
        if (x === w.x && y === w.y) return w
        changed = true
        return { ...w, x, y }
      })
      return changed ? { ...state, wins } : state
    }
  }
}
