import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'motion/react'
import { useRef, type CSSProperties } from 'react'
import { AppGlyph, apps, type AppDef } from './apps'
import type { Win } from './desktopState'

interface Props {
  wins: Win[]
  focusedId?: string
  reduced: boolean
  register: (id: string, el: HTMLElement | null) => void
  onOpen: (id: string) => void
}

const BASE = 44
const PEAK = 60

function Item({ app, win, focused, mouseY, reduced, register, onOpen }: { app: AppDef; win?: Win; focused: boolean; mouseY: MotionValue<number>; reduced: boolean; register: Props['register']; onOpen: Props['onOpen'] }) {
  const ref = useRef<HTMLButtonElement | null>(null)
  const dist = useTransform(mouseY, (v) => {
    const r = ref.current?.getBoundingClientRect()
    return r && Number.isFinite(v) ? v - (r.top + r.height / 2) : 9999
  })
  const raw = useTransform(dist, [-120, 0, 120], [BASE, PEAK, BASE])
  const size = useSpring(raw, { stiffness: 480, damping: 34, mass: 0.35 })
  const p = app.product
  const state = !win ? 'closed' : win.min ? 'minimised' : 'open'
  return (
    <li className="sos-dock-li">
      <motion.button
        ref={(el) => {
          ref.current = el
          register(app.id, el)
        }}
        type="button"
        className={`sos-dock-item ${p ? 'is-product' : 'is-system'} ${focused ? 'is-focused' : ''}`}
        style={{ width: reduced ? BASE : size, height: reduced ? BASE : size, ...(p ? ({ '--hue': p.hue.ink, '--hue-wash': p.hue.wash } as CSSProperties) : {}) }}
        aria-label={`${app.title} — ${state === 'open' ? 'focus window' : state === 'minimised' ? 'restore window' : 'open'}`}
        data-state={state}
        onClick={() => onOpen(app.id)}
      >
        <AppGlyph app={app} size={22} />
      </motion.button>
      <span className="sos-dock-run" data-state={state} aria-hidden="true" />
      <span className="sos-dock-tip" aria-hidden="true">
        <b>{app.title}</b>
        <span>{app.hint}</span>
      </span>
    </li>
  )
}

export function Dock({ wins, focusedId, reduced, register, onOpen }: Props) {
  const mouseY = useMotionValue(Infinity)
  const productApps = apps.filter((a) => a.kind === 'product')
  const systemApps = apps.filter((a) => a.kind === 'system')
  const item = (a: AppDef) => <Item key={a.id} app={a} win={wins.find((w) => w.id === a.id)} focused={focusedId === a.id} mouseY={mouseY} reduced={reduced} register={register} onOpen={onOpen} />
  return (
    <nav className="sos-dock" aria-label="Dock" onMouseMove={(e) => mouseY.set(e.clientY)} onMouseLeave={() => mouseY.set(Infinity)}>
      <ul aria-label="Work">{productApps.map(item)}</ul>
      <span className="sos-dock-sep" aria-hidden="true" />
      <ul aria-label="Studio">{systemApps.map(item)}</ul>
    </nav>
  )
}
