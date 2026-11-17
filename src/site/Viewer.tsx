/**
 * Screen viewer — the top of every product page.
 *
 * One plain idea: choose a topic, and the screen changes to show that part of
 * the app. Topics are the product's own "what it covers" list, so the viewer
 * needs no per-product code, and real screenshots fill it as they are added.
 */
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useMemo, useState } from 'react'
import type { Product, Surface, Theme } from '../data/products'
import { hasThemeMedia, realMedia } from '../media/manifest'
import { ZoomDialog } from '../media/ZoomDialog'
import { AppPose } from './landing/shared'
import './landing/landing.css'
import { EASE } from './ui'

const deviceWord: Record<Surface, string> = { desktop: 'Desktop', mobile: 'Phone' }

export function Viewer({ product }: { product: Product }) {
  const reduce = useReducedMotion()
  const [slot, setSlot] = useState(1)
  const [surface, setSurface] = useState<Surface>(product.primarySurface)
  const [zoom, setZoom] = useState(false)
  const n = product.focus.length
  const topic = product.focus[slot - 1]
  // an app with two themes shows both, when it has captures of both
  const other = product.themes.find((t) => t !== product.themes[0] && hasThemeMedia(product.slug, t))
  const [theme, setTheme] = useState<Theme>(product.themes[0])
  const placeholder = !realMedia(product.slug, surface, slot, theme)
  // the chosen device stands in front; the other sits beside it
  const shown = useMemo(() => ({ ...product, primarySurface: surface }), [product, surface])
  const step = (d: number) => setSlot((s) => ((s - 1 + d + n) % n) + 1)

  return (
    <section className="vw" aria-labelledby="vw-h">
      <div className="vw-head">
        <h2 id="vw-h" className="sp-h2">
          See what it <em>covers.</em>
        </h2>
        <p className="sp-body">
          {placeholder
            ? 'Choose a topic. The screen changes to show that part of the app.'
            : 'Choose a topic. These are screenshots of the working app, taken with made-up sample data.'}
        </p>
      </div>

      <div className="vw-frame">
        <div className="vw-tabs" role="group" aria-label="Topics">
          {product.focus.map((f, k) => (
            <button key={f.title} type="button" aria-pressed={slot === k + 1} onClick={() => setSlot(k + 1)}>
              <span className="vw-n">{k + 1}</span>
              {f.title}
            </button>
          ))}
        </div>

        <div className="vw-stage">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${surface}-${slot}-${theme}`}
              className="vw-stage-item"
              initial={reduce ? false : { opacity: 0, x: 22 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: -22 }}
              transition={reduce ? { duration: 0 } : { duration: 0.26, ease: EASE }}
            >
              <AppPose product={shown} slot={slot} theme={theme} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="vw-bar">
          <button type="button" className="vw-arrow" onClick={() => step(-1)} aria-label="Previous topic">
            ←
          </button>
          <p className="vw-caption" aria-live="polite">
            <b>
              {slot} of {n} · {topic.title}
            </b>
            <span>{topic.note}</span>
          </p>
          <div className="vw-tools">
            {placeholder && <span className="vw-note">Placeholder image — real screenshot to come</span>}
            {other && (
              <div className="sp-seg" role="group" aria-label="Theme">
                {product.themes.map((t) => (
                  <button key={t} type="button" aria-pressed={theme === t} onClick={() => setTheme(t)}>
                    {t === 'dark' ? 'Dark' : 'Light'}
                  </button>
                ))}
              </div>
            )}
            {product.surfaces.length > 1 && (
              <div className="sp-seg" role="group" aria-label="Device in front">
                {product.surfaces.map((s) => (
                  <button key={s} type="button" aria-pressed={surface === s} onClick={() => setSurface(s)}>
                    {deviceWord[s]}
                  </button>
                ))}
              </div>
            )}
            <button type="button" className="vw-enlarge" onClick={() => setZoom(true)}>
              Enlarge
            </button>
          </div>
          <button type="button" className="vw-arrow" onClick={() => step(1)} aria-label="Next topic">
            →
          </button>
        </div>
      </div>
      {zoom && <ZoomDialog product={product} surface={surface} slot={slot} label={topic.title} theme={theme} onClose={() => setZoom(false)} />}
    </section>
  )
}
