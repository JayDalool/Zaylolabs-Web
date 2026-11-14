import { lazy, Suspense, useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { studio } from '../../data/products'
import { detectWebGL, useIsNarrow, useMediaQuery, usePrefersReducedMotion } from '../../shared/env'
import { BrandMark, EndCopy, FitName, IntroCopy, ProductCopy, useFitNames } from './Copy'
import { SiteNav, SkipLink } from './kit'
import { StaticView } from './Static'
import { BASE, COUNT, depthLabel, flight, plateau, stations, VOLT } from './stations'
import './zaxis.css'
import './pages.css'

const Gallery = lazy(() => import('./Gallery'))
const ProductPage = lazy(() => import('./Product'))
const System = lazy(() => import('./System'))

// The WebGL scene (three + R3F + shaders) is its own chunk: the text shell paints first.
const Scene = lazy(() => import('./Scene'))

/** Scroll distance per station, in viewport heights. */
const STEP = 1.5
const two = (n: number) => String(n).padStart(2, '0')
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
const hex = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16))
const HUES = stations.map((s) => hex(s.hue))

/** Z-Axis site: the flight is the homepage; work, product and system pages sit beside it. */
export default function ZAxisSite() {
  return (
    <Suspense fallback={<div className="zx" aria-busy="true" />}>
      <Routes>
        <Route index element={<Home />} />
        <Route path="work" element={<Gallery />} />
        <Route path="work/:slug" element={<ProductPage />} />
        <Route path="system" element={<System />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Suspense>
  )
}

function Home() {
  const reduced = usePrefersReducedMotion()
  const narrow = useIsNarrow()
  const [webgl] = useState(detectWebGL)
  useEffect(() => {
    document.title = 'ZayloLabs — design prototype'
  }, [])
  // No WebGL, or the visitor asked for less motion → the same content as a still, stacked page.
  if (!webgl || reduced) return <StaticView reason={!webgl ? 'webgl' : 'motion'} />
  return <Flight narrow={narrow} />
}

function Flight({ narrow }: { narrow: boolean }) {
  // Phones and portrait tablets get the stacked composition: name / windows / copy.
  const stacked = useMediaQuery('(max-width: 767.98px), (max-aspect-ratio: 21/20)')
  const root = useRef<HTMLDivElement>(null)
  const names = useRef<(HTMLElement | null)[]>([])
  const copies = useRef<(HTMLElement | null)[]>([])
  const depth = useRef<HTMLSpanElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const [active, setActive] = useState(0)
  const activeRef = useRef(0)

  useFitNames(root, stacked)

  const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
  const goTo = useCallback((i: number) => {
    const k = Math.min(COUNT - 1, Math.max(0, i))
    window.scrollTo({ top: (k / (COUNT - 1)) * maxScroll(), behavior: 'smooth' })
  }, [])

  useEffect(() => {
    let raf = 0
    let last = performance.now()
    let lastHue = ''
    const target = () => {
      const raw = (window.scrollY / maxScroll()) * (COUNT - 1)
      const i = Math.min(COUNT - 2, Math.max(0, Math.floor(raw)))
      return i + plateau(Math.min(1, Math.max(0, raw - i)))
    }
    flight.p = target()
    flight.vel = 0

    const apply = (p: number) => {
      for (let i = 0; i < COUNT; i++) {
        const d = p - i
        const ad = Math.abs(d)
        const name = names.current[i]
        if (name) {
          // type travels on the same axis: it grows toward you, then you fly through it
          const o = 1 - smooth(0.16, 0.5, ad)
          name.style.opacity = o.toFixed(3)
          name.style.transform = `translate3d(0,${(-d * 6).toFixed(2)}vh,0) scale(${Math.exp(d * 1.3).toFixed(4)})`
          name.style.pointerEvents = o > 0.6 ? 'auto' : 'none'
        }
        const copy = copies.current[i]
        if (copy) {
          const o = 1 - smooth(0.08, 0.3, ad)
          copy.style.opacity = o.toFixed(3)
          copy.style.transform = `translate3d(0,${(-d * 90).toFixed(1)}px,0)`
          copy.style.pointerEvents = o > 0.6 ? 'auto' : 'none'
        }
      }
      if (depth.current) depth.current.textContent = depthLabel(p)
      if (bar.current) bar.current.style.setProperty('--p', (p / (COUNT - 1)).toFixed(4))
      const i = Math.min(COUNT - 2, Math.floor(p))
      const t = smooth(0.3, 0.7, p - i)
      const c = HUES[i].map((v, k) => Math.round(v + (HUES[i + 1][k] - v) * t))
      const hue = `rgb(${c[0]} ${c[1]} ${c[2]})`
      if (hue !== lastHue) root.current?.style.setProperty('--zx-hue', (lastHue = hue))
      const a = Math.round(p)
      if (a !== activeRef.current) setActive((activeRef.current = a))
    }

    const tick = (now: number) => {
      const dt = Math.min(0.1, Math.max(0.001, (now - last) / 1000))
      last = now
      const t = target()
      const prev = flight.p
      flight.p += (t - flight.p) * (1 - Math.exp(-dt * 6.5))
      if (Math.abs(t - flight.p) < 0.0004) flight.p = t
      flight.vel += ((flight.p - prev) / dt - flight.vel) * 0.3
      apply(flight.p)
      raf = requestAnimationFrame(tick)
    }
    apply(flight.p)
    raf = requestAnimationFrame(tick)

    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      flight.pointerX = (e.clientX / window.innerWidth - 0.5) * 2
      flight.pointerY = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
      flight.pointerX = flight.pointerY = 0
    }
  }, [])

  // Arriving from another page's Contact link lands on the last station.
  const { hash } = useLocation()
  useEffect(() => {
    if (hash === '#contact') requestAnimationFrame(() => window.scrollTo({ top: maxScroll(), behavior: 'instant' }))
  }, [hash])

  // ← / → step between stations; ↑ / ↓ and the wheel still scroll freely.
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || (e.target as HTMLElement)?.closest?.('input, textarea, [contenteditable]')) return
      if (e.key === 'ArrowRight') goTo(activeRef.current + 1)
      if (e.key === 'ArrowLeft') goTo(activeRef.current - 1)
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [goTo])

  // Keyboard: tabbing into a station that is not on screen brings it into view.
  const focusStation = (i: number) => () => {
    if (Math.abs(flight.p - i) > 0.3) goTo(i)
  }

  const current = stations[active]

  return (
    <div className="zx zx-flight" ref={root} data-stacked={stacked || undefined} data-origin={active === 0 || undefined}>
      <div className="zx-glow" aria-hidden="true" />
      <div className="zx-track" style={{ height: `calc(${(COUNT - 1) * STEP * 100}vh + 100vh)` }} aria-hidden="true" />

      <div className="zx-stage" aria-hidden="true">
        <Suspense fallback={null}>
          <Scene narrow={narrow} stacked={stacked} />
        </Suspense>
      </div>

      {/* Focusing the first product link flies to its station (see focusStation). */}
      <SkipLink label="Skip to the products" onActivate={() => root.current?.querySelector<HTMLElement>('.zx-station[data-side] a')?.focus({ preventScroll: true })} />
      <header className="zx-hud-top">
        <button type="button" className="zx-brand" onClick={() => goTo(0)} aria-label="ZayloLabs — back to the start">
          <BrandMark />
          <span>
            Zaylo<b>Labs</b>
          </span>
        </button>
        <SiteNav onContact={() => goTo(COUNT - 1)} />
        <p className="zx-readout" aria-hidden="true">
          <span className="zx-readout-depth" ref={depth}>
            {depthLabel(0)}
          </span>
          <span className="zx-readout-stn">
            STN {two(active)}/{two(COUNT - 1)}
          </span>
        </p>
      </header>

      <main id="zx-main" tabIndex={-1}>
        {stations.map((s, i) => {
          const style = { '--hue': s.hue } as CSSProperties
          const nameRef = (el: HTMLElement | null) => void (names.current[i] = el)
          const copyRef = (el: HTMLElement | null) => void (copies.current[i] = el)
          if (s.kind === 'intro') {
            return (
              <section key={s.id} className="zx-station zx-station-intro" aria-labelledby="zx-h-origin" style={style}>
                <div className="zx-name zx-wordmark" ref={nameRef} data-fit={stacked ? 0.9 : 0.72} data-max={0.3}>
                  <p className="zx-eyebrow">
                    <span>{studio.line}</span>
                    <span className="zx-dim">{studio.domain}</span>
                  </p>
                  <h1 id="zx-h-origin">
                    <span className="zx-fit">
                      Zaylo<em>Labs</em>
                    </span>
                  </h1>
                </div>
                <div className="zx-copy zx-copy-intro" ref={copyRef}>
                  <IntroCopy />
                  {stacked && (
                    <ol className="zx-index" aria-label="Products">
                      {stations.map((p, k) =>
                        p.product ? (
                          <li key={p.id}>
                            <button type="button" style={{ '--hue': p.hue } as CSSProperties} onClick={() => goTo(k)}>
                              <span className="zx-index-n">{two(k)}</span>
                              <span>
                                {p.label}
                                <small>{p.product.stageLabel}</small>
                              </span>
                            </button>
                          </li>
                        ) : null,
                      )}
                    </ol>
                  )}
                  <div className="zx-intro-actions">
                    <button type="button" className="zx-cue" onClick={() => goTo(1)}>
                      <span className="zx-cue-line" aria-hidden="true" />
                      Scroll to travel
                    </button>
                    <Link className="zx-open" to={`${BASE}/work`} viewTransition>
                      Or view all work <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              </section>
            )
          }
          if (s.kind === 'end') {
            return (
              <section key={s.id} className="zx-station zx-station-end" aria-labelledby="zx-h-studio" style={style} onFocus={focusStation(i)}>
                <h2 className="zx-name" id="zx-h-studio" ref={nameRef} data-fit={stacked ? 0.9 : 0.86} data-max={0.3}>
                  <span className="zx-fit">Studio</span>
                </h2>
                <div className="zx-copy zx-copy-end" ref={copyRef}>
                  <EndCopy onReturn={() => goTo(0)} />
                </div>
              </section>
            )
          }
          const product = s.product!
          return (
            <section key={s.id} className="zx-station" data-side={s.side} aria-labelledby={`zx-h-${s.id}`} style={style} onFocus={focusStation(i)}>
              <h2 className="zx-name" id={`zx-h-${s.id}`} ref={nameRef} data-fit={stacked ? 0.9 : 0.92} data-max={stacked ? 0.14 : 0.3}>
                <FitName name={product.name} alias={product.alias} />
              </h2>
              <div className="zx-copy" ref={copyRef}>
                <ProductCopy product={product} index={i} placeholder={false} />
              </div>
            </section>
          )
        })}
      </main>

      {/* ————— HUD ————— */}
      <nav className="zx-rail" aria-label="Stations" aria-hidden={stacked || undefined} inert={stacked}>
        <span className="zx-rail-track" aria-hidden="true">
          <span className="zx-rail-bar" ref={bar} />
        </span>
        <ol>
          {stations.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                className={i === active ? 'is-active' : ''}
                style={{ '--hue': s.hue } as CSSProperties}
                aria-current={i === active ? 'step' : undefined}
                aria-label={`${two(i)} ${s.label}`}
                onClick={() => goTo(i)}
              >
                <span className="zx-rail-label">
                  <span className="zx-rail-n">{two(i)}</span> {s.label}
                  {s.product && <span className="zx-rail-stage">{s.product.stageLabel}</span>}
                </span>
                <span className="zx-rail-dot" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="zx-hud-status" aria-live="polite">
        <p className="zx-status-line">
          <i aria-hidden="true" style={{ background: current.hue ?? VOLT }} />
          <span>{current.label}</span>
          <span className="zx-dim zx-status-stage">{current.product ? current.product.stageLabel : current.kind === 'intro' ? 'Start of line' : 'End of line'}</span>
        </p>
        {current.placeholder && <p className="zx-status-ph">Placeholder schematic — real capture pending</p>}
      </div>
    </div>
  )
}
