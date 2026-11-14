import { motion, useDragControls, useMotionValue } from 'motion/react'
import { useEffect, useRef, type Dispatch, type KeyboardEvent, type ReactNode, type RefObject } from 'react'
import { AppGlyph, type AppDef } from './apps'
import { DOCK_W, maxRect, sizeOf, type Action, type Viewport, type Win } from './desktopState'

interface Props {
  win: Win
  app: AppDef
  vp: Viewport
  focused: boolean
  reduced: boolean
  deskRef: RefObject<HTMLDivElement | null>
  /** Centre of this app's dock icon, in desk coordinates. */
  origin: { x: number; y: number }
  dispatch: Dispatch<Action>
  onSettle: (x: number, y: number) => void
  children: ReactNode
}

export function Window({ win, app, vp, focused, reduced, deskRef, origin, dispatch, onSettle, children }: Props) {
  const ref = useRef<HTMLElement>(null)
  const controls = useDragControls()
  const base = sizeOf(app, vp)
  const mr = maxRect(vp)
  const w = win.max ? mr.w : base.w
  const h = win.max ? mr.h : base.h
  const tx = win.max ? mr.x : win.x
  const ty = win.max ? mr.y : win.y
  const x = useMotionValue(tx)
  const y = useMotionValue(ty)

  // Windows the visitor opens take keyboard focus; the initial composition does not.
  useEffect(() => {
    if (!win.auto) ref.current?.focus({ preventScroll: true })
  }, [win.auto])

  const docked = { x: origin.x - w / 2, y: origin.y - h / 2, scale: 0.05, opacity: 0, width: w, height: h }
  const rest = { x: tx, y: ty, scale: 1, opacity: 1, width: w, height: h }

  const onKey = (e: KeyboardEvent) => {
    if (!e.altKey || win.max) return
    const step = e.shiftKey ? 96 : 24
    const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key]
    if (!d) return
    e.preventDefault()
    const nx = Math.max(DOCK_W - 12, Math.min(vp.w - w, win.x + d[0]))
    const ny = Math.max(0, Math.min(vp.h - 34 - 40, win.y + d[1]))
    dispatch({ type: 'move', id: win.id, x: nx, y: ny })
  }

  return (
    <motion.section
      ref={ref}
      role="dialog"
      aria-label={`${app.title} window`}
      tabIndex={-1}
      inert={win.min}
      className={`sos-win ${focused ? 'is-focused' : ''} ${app.dark ? 'is-dark' : ''} ${win.max ? 'is-max' : ''} sos-win-${app.id}`}
      style={{ x, y, zIndex: win.z, width: w, height: h }}
      initial={reduced ? false : win.auto ? { ...rest, opacity: 0, scale: 0.94, y: ty + 18 } : docked}
      animate={win.min ? docked : rest}
      exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.97, transition: { duration: 0.13 } }}
      transition={reduced ? { duration: 0 } : win.auto ? { type: 'spring', stiffness: 260, damping: 30, delay: 0.08 * win.z } : { type: 'spring', stiffness: 400, damping: 34, mass: 0.85 }}
      drag={!win.max}
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0.06}
      dragConstraints={deskRef}
      onDragStart={() => ref.current?.classList.add('is-dragging')}
      onDragEnd={() => {
        ref.current?.classList.remove('is-dragging')
        dispatch({ type: 'move', id: win.id, x: x.get(), y: y.get() })
        onSettle(x.get() + w / 2, y.get() + h / 2)
      }}
      onPointerDownCapture={() => dispatch({ type: 'focus', id: win.id })}
      onFocusCapture={() => dispatch({ type: 'focus', id: win.id })}
      onKeyDown={onKey}
    >
      <header
        className="sos-win-bar"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest('button')) return
          controls.start(e)
        }}
        onDoubleClick={(e) => {
          if (!(e.target as HTMLElement).closest('button')) dispatch({ type: 'toggleMax', id: win.id })
        }}
      >
        <span className="sos-win-ctl">
          <button type="button" className="sos-ctl sos-ctl-close" aria-label={`Close ${app.title} window`} onClick={() => dispatch({ type: 'close', id: win.id })}>
            <i aria-hidden="true" />
          </button>
          <button type="button" className="sos-ctl sos-ctl-min" aria-label={`Minimise ${app.title} window to the dock`} onClick={() => dispatch({ type: 'minimise', id: win.id })}>
            <i aria-hidden="true" />
          </button>
          <button type="button" className="sos-ctl sos-ctl-max" aria-label={`${win.max ? 'Restore' : 'Maximise'} ${app.title} window`} aria-pressed={win.max} onClick={() => dispatch({ type: 'toggleMax', id: win.id })}>
            <i aria-hidden="true" />
          </button>
        </span>
        <span className="sos-win-title">
          <span className="sos-win-glyph" style={app.product ? { color: app.dark ? app.product.hue.bright : app.product.hue.ink } : undefined}>
            <AppGlyph app={app} size={16} />
          </span>
          {app.title}
        </span>
        <span className="sos-win-tag">{app.product ? `${app.product.catalog} · ${app.product.stageLabel}` : 'System'}</span>
      </header>
      <div className="sos-win-body">{children}</div>
    </motion.section>
  )
}
