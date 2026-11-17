/**
 * Demo player — a small app window that walks through one use of the app,
 * step by step. The visitor can press play, use Back/Next, pick a step, or
 * click the highlighted control inside the window.
 *
 * Everything shown is an illustration with made-up data, and says so.
 */
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import type { Product, Theme } from '../../data/products'
import { EASE, SectionHead } from '../ui'
import './demo.css'
import './skins.css'
import { demos, type Demo } from './demos'

const PACE = 3600 // ms per step while playing

function Player({ demo, product }: { demo: Demo; product: Product }) {
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [theme, setTheme] = useState<Theme>(product.themes[0])
  const n = demo.steps.length
  const step = demo.steps[i]
  const last = i === n - 1
  const next = () => setI((v) => Math.min(n - 1, v + 1))

  // Steps advance while playing, and progress-style steps always move on by themselves.
  useEffect(() => {
    if (last) return setPlaying(false)
    const wait = step.auto ?? (playing ? PACE : 0)
    if (!wait) return
    const t = window.setTimeout(next, wait)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, playing])

  return (
    <div className="dm" data-device={demo.device}>
      <ol className="dm-steps" aria-label="Steps">
        {demo.steps.map((s, k) => (
          <li key={s.title}>
            <button
              type="button"
              aria-current={k === i ? 'step' : undefined}
              data-done={k < i || undefined}
              onClick={() => {
                setPlaying(false)
                setI(k)
              }}
            >
              <span className="dm-step-n">{k + 1}</span>
              <span>
                <b>{s.title}</b>
                {k === i && <small>{s.note}</small>}
              </span>
            </button>
          </li>
        ))}
      </ol>

      <div className="dm-stage">
        <div className="dm-device" data-app={product.slug} data-theme={theme}>
          <div className="dm-chrome" aria-hidden="true">
            {demo.device === 'window' && (
              <span className="dm-dots">
                <i />
                <i />
                <i />
              </span>
            )}
            <b>{product.name}</b>
            <span className="dm-badge">Demo · sample data</span>
          </div>
          <div className="dm-screen">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={i}
                className="dm-scene"
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={reduce ? { duration: 0 } : { duration: 0.22, ease: EASE }}
              >
                {step.scene(next)}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="dm-controls">
          <button type="button" className="dm-ctl" onClick={() => (setPlaying(false), setI((v) => Math.max(0, v - 1)))} disabled={i === 0}>
            Back
          </button>
          {last ? (
            <button type="button" className="dm-ctl dm-ctl-main" onClick={() => (setI(0), setPlaying(false))}>
              Start again
            </button>
          ) : (
            <button type="button" className="dm-ctl dm-ctl-main" onClick={() => setPlaying((v) => !v)} aria-pressed={playing}>
              {playing ? 'Pause' : i === 0 ? 'Play the demo' : 'Play'}
            </button>
          )}
          <button type="button" className="dm-ctl" onClick={() => (setPlaying(false), next())} disabled={last}>
            Next
          </button>
          <p className="dm-count" aria-live="polite">
            Step {i + 1} of {n}
          </p>
          {product.themes.length > 1 && (
            <div className="sp-seg dm-theme" role="group" aria-label={`${product.name} theme`}>
              {product.themes.map((t) => (
                <button key={t} type="button" aria-pressed={theme === t} onClick={() => setTheme(t)}>
                  {t === 'dark' ? 'Dark' : 'Light'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/** The demo section of a product page: the main demo, plus tabs when the app has more tools to show. */
export function DemoSection({ product }: { product: Product }) {
  const list = demos[product.slug]
  const [at, setAt] = useState(0)
  if (!list?.length) return null
  const demo = list[Math.min(at, list.length - 1)]
  return (
    <section id="demo" className="sp-section dm-section" style={{ scrollMarginTop: '4rem' }} aria-labelledby="demo-h">
      <div className="sp-wrap">
        <SectionHead
          label="Demo"
          title={
            <span id="demo-h">
              See it <em>step by step.</em>
            </span>
          }
        />
        <p className="dm-disclaimer">
          <b>This is a demo, not the real app.</b> The screens are redrawn from {product.name} in its own colours and wording, with made-up data, so you can follow
          how it is used. Press play, or click the highlighted control inside the window.
        </p>
        {list.length > 1 && (
          <div className="dm-tabs" role="group" aria-label="Demos">
            {list.map((d, k) => (
              <button key={d.id} type="button" aria-pressed={k === at} onClick={() => setAt(k)}>
                {k === 0 && <span className="dm-tab-main">Main</span>}
                {d.label}
              </button>
            ))}
          </div>
        )}
        <p className="dm-summary">{demo.summary}</p>
        <Player key={demo.id} demo={demo} product={product} />
      </div>
    </section>
  )
}
