/**
 * Landing A — the showpiece.
 *
 * "Software, built layer by layer", made literal: each app is one sheet
 * in one exploded stack. The stack stays pinned while the visitor scrolls; each
 * step lifts one sheet out to face them, floods the screen with that app's
 * colours, and puts the whole of that app — what it is, what it covers, its
 * stage, its screens — on one screen.
 *
 * With reduced motion the simple landing is shown instead.
 */
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import { useRef, useState, type CSSProperties } from 'react'
import { featured as products, studio, type Product } from '../../data/products'
import { PhoneFrame, ProductMedia, WindowFrame } from '../../media/ProductMedia'
import { BASE, ButtonLink, EASE, hueVars } from '../ui'
import LandingB from './LandingB'
import { AppCopy, count } from './shared'

const MID = (count - 1) / 2

/** What is drawn on one sheet of the stack. */
function Sheet({ product, slot, front }: { product: Product; slot: number; front: boolean }) {
  const label = product.focus[slot - 1]?.title
  const desktop = product.surfaces.includes('desktop')
  const mobile = product.surfaces.includes('mobile')
  return (
    <WindowFrame title={product.name} className="la-win">
      {desktop ? (
        <ProductMedia product={product} surface="desktop" slot={product.primarySurface === 'desktop' ? slot : 1} label={product.primarySurface === 'desktop' ? label : undefined} />
      ) : (
        <div className="la-bench">
          <PhoneFrame className="la-bench-phone">
            <ProductMedia product={product} surface="mobile" slot={slot} label={label} />
          </PhoneFrame>
          <PhoneFrame className="la-bench-phone la-bench-phone-2">
            <ProductMedia product={product} surface="mobile" slot={slot === 1 ? 2 : 1} />
          </PhoneFrame>
        </div>
      )}
      {desktop && mobile && (
        <PhoneFrame className="la-side-phone" style={{ opacity: front ? 1 : 0 }}>
          <ProductMedia product={product} surface="mobile" slot={product.primarySurface === 'mobile' ? slot : 1} />
        </PhoneFrame>
      )}
    </WindowFrame>
  )
}

export default function LandingA() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const [step, setStep] = useState(0) // 0 = the stack, 1…n = one app each
  const [slots, setSlots] = useState<Record<string, number>>({})
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const s = Math.min(count, Math.max(0, Math.round(v * count)))
    setStep((cur) => (cur === s ? cur : s))
  })

  if (reduce) return <LandingB />

  const k = step - 1 // index of the app in front, or -1
  const product = k >= 0 ? products[k] : products[0]
  const goTo = (s: number) => {
    const el = ref.current
    if (!el) return
    const span = el.offsetHeight - window.innerHeight
    window.scrollTo({ top: el.offsetTop + (s / count) * span, behavior: 'smooth' })
  }

  return (
    <section
      ref={ref}
      className="la sp-immersive sp-immersive-field"
      data-hue=""
      data-immersed={k >= 0 || undefined}
      style={{ ...hueVars(product), height: `calc(${count + 1} * 100dvh)` } as CSSProperties}
      aria-label="ZayloLabs and its products"
    >
      {/* the page keeps one real heading while the pinned copy changes */}
      <h1 className="sr-only-focusable" tabIndex={-1}>
        {studio.name} — {studio.line}
      </h1>
      {/* one resting point per step, so the page settles with a whole app on screen */}
      {Array.from({ length: count + 1 }, (_, i) => (
        <span key={i} className="la-rest sp-snap" id={i ? products[i - 1].slug : undefined} style={{ top: `calc(${i} * 100dvh)` }} aria-hidden="true" />
      ))}

      <div className="la-pin">
        <div className="sp-wrap la-grid">
          <div className="la-copy">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28, ease: EASE }}
              >
                {k < 0 ? (
                  <div className="la-intro" role="group" aria-labelledby="la-h">
                    <p className="sp-mono lb-kicker">
                      <span className="sp-signal">{studio.name}</span>
                      <span className="sp-mono-dim">Independent software studio</span>
                    </p>
                    <p id="la-h" className="sp-display lb-h" role="heading" aria-level={2}>
                      Software, built <em>layer by layer.</em>
                    </p>
                    <p className="sp-lede">{studio.about} Scroll, and each layer of the stack becomes one of our apps.</p>
                    <div className="lb-cta">
                      <ButtonLink to="/#contact" viewTransition={false}>
                        Start a conversation
                      </ButtonLink>
                      <ButtonLink ghost to={`${BASE}/work`}>
                        See all products
                      </ButtonLink>
                    </div>
                  </div>
                ) : (
                  <AppCopy product={product} slot={slots[product.slug] ?? 1} onSlot={(n) => setSlots((s) => ({ ...s, [product.slug]: n }))} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="la-stage">
            {products.map((p, i) => {
              const front = i === k
              const target =
                k < 0
                  ? { rotateX: 57, rotateZ: -34, scale: 0.72, x: '0%', y: `${(MID - i) * 21}%`, opacity: 1 }
                  : front
                    ? { rotateX: 0, rotateZ: 0, scale: 1, x: '0%', y: '0%', opacity: 1 }
                    : { rotateX: 57, rotateZ: -34, scale: 0.28, x: '-41%', y: `${60 + (MID - i) * 7}%`, opacity: 0.85 }
              return (
                <motion.button
                  key={p.slug}
                  type="button"
                  className="la-sheet"
                  data-hue=""
                  data-front={front || undefined}
                  style={{ ...hueVars(p), zIndex: front ? 20 : i + 1 } as CSSProperties}
                  initial={false}
                  animate={target}
                  transition={{ duration: 0.85, ease: EASE }}
                  onClick={() => goTo(i + 1)}
                  // a shortcut for the mouse; the steps along the bottom are the labelled, keyboard route
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <Sheet product={p} slot={slots[p.slug] ?? 1} front={front} />
                </motion.button>
              )
            })}
          </div>
        </div>

        <nav className="la-rail" aria-label="Steps">
          <div className="sp-wrap la-rail-in">
            <button type="button" aria-current={step === 0 ? 'step' : undefined} onClick={() => goTo(0)}>
              Start
            </button>
            {products.map((p, i) => (
              <button key={p.slug} type="button" data-hue="" style={hueVars(p)} aria-label={p.name} aria-current={step === i + 1 ? 'step' : undefined} onClick={() => goTo(i + 1)}>
                <i aria-hidden="true" />
                <span>{p.name}</span>
              </button>
            ))}
            <span className="sp-mono la-rail-cue" aria-hidden="true">
              {step < count ? 'Scroll ↓' : 'Keep scrolling ↓'}
            </span>
          </div>
        </nav>
      </div>
    </section>
  )
}
