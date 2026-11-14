import { AnimatePresence } from 'motion/react'
import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState, type CSSProperties } from 'react'
import { products, stages, studio } from '../../data/products'
import { dprRange, usePrefersReducedMotion, useWebGL } from '../../shared/env'
import { appById, apps } from './apps'
import { AppContent, OsContext, type OsApi } from './content'
import { DOCK_W, initialState, MENU_H, reducer, type Viewport } from './desktopState'
import { Dock } from './Dock'
import { brandLabel, MenuBar, workItems, type MenuDef } from './MenuBar'
import { buildActions, Palette } from './Palette'
import { Window } from './Window'

const Wallpaper = lazy(() => import('./Wallpaper'))

function useViewport(): Viewport {
  const [vp, setVp] = useState<Viewport>(() => ({ w: window.innerWidth, h: window.innerHeight }))
  useEffect(() => {
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return vp
}

export const modKey = () => (typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? '⌘' : 'Ctrl')

export default function Desktop() {
  const vp = useViewport()
  const reduced = usePrefersReducedMotion()
  const webgl = useWebGL()
  const [state, dispatch] = useReducer(reducer, vp, initialState)
  const [palette, setPalette] = useState(false)
  const [glReady, setGlReady] = useState(false)
  const deskRef = useRef<HTMLDivElement>(null)
  const boundsRef = useRef<HTMLDivElement>(null)
  const icons = useRef(new Map<string, HTMLElement>())
  const mod = useMemo(() => modKey(), [])

  // Keep windows reachable when the viewport shrinks.
  useEffect(() => dispatch({ type: 'clamp', vp }), [vp])

  const pulse = useCallback((x: number, y: number) => {
    // x/y are desk coordinates; the wallpaper wants client coordinates.
    window.dispatchEvent(new CustomEvent('sos:pulse', { detail: { x, y: y + MENU_H } }))
  }, [])

  const measure = useCallback((id: string) => {
    const el = icons.current.get(id)
    const desk = deskRef.current?.getBoundingClientRect()
    if (!el || !desk) return { x: DOCK_W / 2, y: (window.innerHeight - MENU_H) / 2 }
    const r = el.getBoundingClientRect()
    return { x: r.left + r.width / 2 - desk.left, y: r.top + r.height / 2 - desk.top }
  }, [])

  // Dock icon centres, in desk coordinates — where windows spring from and minimise to.
  const [origins, setOrigins] = useState<Record<string, { x: number; y: number }>>({})
  useLayoutEffect(() => {
    setOrigins(Object.fromEntries(apps.map((a) => [a.id, measure(a.id)])))
  }, [measure, vp])
  const fallbackOrigin = { x: DOCK_W / 2, y: (vp.h - MENU_H) / 2 }

  const open = useCallback(
    (id: string) => {
      dispatch({ type: 'open', id, vp: { w: window.innerWidth, h: window.innerHeight } })
      const o = measure(id)
      pulse(o.x, o.y)
      // An already-open window needs focus moved to it explicitly.
      requestAnimationFrame(() => document.querySelector<HTMLElement>(`.sos-win-${id}`)?.focus({ preventScroll: true }))
    },
    [measure, pulse],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPalette((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const visible = state.wins.filter((w) => !w.min)
  const focusedId = visible.length ? visible.reduce((a, b) => (a.z > b.z ? a : b)).id : undefined

  const desk = useMemo(
    () => ({
      tidy: () => dispatch({ type: 'tidy', vp: { w: window.innerWidth, h: window.innerHeight } }),
      cascade: () => dispatch({ type: 'cascade', vp: { w: window.innerWidth, h: window.innerHeight } }),
      closeAll: () => dispatch({ type: 'closeAll' }),
      reset: () => dispatch({ type: 'reset', vp: { w: window.innerWidth, h: window.innerHeight } }),
    }),
    [],
  )
  const actions = useMemo(() => buildActions(open, desk), [open, desk])

  const menus: MenuDef[] = [
    {
      id: 'brand',
      label: brandLabel(),
      ariaLabel: 'ZayloLabs',
      items: [
        { label: 'Read me', onSelect: () => open('readme') },
        { label: 'About this build', onSelect: () => open('about') },
        { label: 'Contact', note: studio.domain, onSelect: () => open('contact') },
      ],
    },
    { id: 'work', label: 'Work', items: [...workItems(open), { label: 'Status of all work', onSelect: () => open('status') }] },
    {
      id: 'view',
      label: 'View',
      items: [
        { label: 'Tidy windows', onSelect: desk.tidy, disabled: !visible.length },
        { label: 'Cascade windows', onSelect: desk.cascade, disabled: !visible.length },
        { label: 'Close all windows', onSelect: desk.closeAll, disabled: !state.wins.length },
        { label: 'Reset desktop', onSelect: desk.reset },
      ],
    },
    {
      id: 'window',
      label: 'Window',
      items: state.wins.length
        ? [...state.wins].sort((a, b) => b.z - a.z).map((w) => ({ label: appById(w.id).title, note: w.min ? 'minimised' : w.id === focusedId ? 'front' : undefined, onSelect: () => open(w.id) }))
        : [{ label: 'No open windows', onSelect: () => {}, disabled: true }],
    },
  ]

  const os: OsApi = useMemo(() => ({ open, openPalette: () => setPalette(true), mod, shell: 'desktop' }), [open, mod])
  const counts = stages.map((s) => `${products.filter((p) => p.stage === s.id).length} ${s.label.toLowerCase()}`).join(' · ')

  return (
    <OsContext.Provider value={os}>
      <div className={`sos sos-d ${glReady ? 'has-gl' : ''}`}>
        <h1 className="sos-vh">ZayloLabs — {studio.line}</h1>
        <div className="sos-wall" aria-hidden="true">
          {webgl && !reduced && (
            <Suspense fallback={null}>
              <Wallpaper dprMax={dprRange(false)[1]} onReady={() => setGlReady(true)} />
            </Suspense>
          )}
          <p className="sos-wall-note">
            <span>{studio.line}</span>
            <span>
              {products.length} projects — {counts}
            </span>
            <span>Drag windows by the title bar · open work from the dock · {mod} K searches</span>
          </p>
          <div className="sos-wordmark">
            Zaylo<span>Labs</span>
          </div>
        </div>

        <MenuBar menus={menus} onPalette={() => setPalette(true)} mod={mod} />

        <main className="sos-desk" ref={deskRef} inert={palette} style={{ '--dock-w': `${DOCK_W}px` } as CSSProperties}>
          {/* Drag bounds: the desk minus the dock gutter, so window controls never slide under the dock. */}
          <div className="sos-bounds" ref={boundsRef} aria-hidden="true" />
          <AnimatePresence>
            {state.wins.map((w) => {
              const app = appById(w.id)
              return (
                <Window key={w.id} win={w} app={app} vp={vp} focused={w.id === focusedId} reduced={reduced} deskRef={boundsRef} origin={origins[w.id] ?? fallbackOrigin} dispatch={dispatch} onSettle={pulse}>
                  <AppContent app={app} />
                </Window>
              )
            })}
          </AnimatePresence>
          {state.wins.length === 0 && (
            <p className="sos-empty">
              Nothing open. Pick something from the dock, or{' '}
              <button type="button" onClick={desk.reset}>
                reset the desktop
              </button>
              .
            </p>
          )}
        </main>

        <Dock
          wins={state.wins}
          focusedId={focusedId}
          reduced={reduced}
          register={(id, el) => {
            if (el) icons.current.set(id, el)
            else icons.current.delete(id)
          }}
          onOpen={open}
        />

        {palette && <Palette actions={actions} onClose={() => setPalette(false)} />}
      </div>
    </OsContext.Provider>
  )
}
