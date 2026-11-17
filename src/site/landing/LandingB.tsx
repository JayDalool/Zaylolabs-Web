/**
 * Landing B — the simple one.
 *
 * One screen: the invitation, one app's screens, and the apps named along
 * the bottom. Pointing at an app floods the whole screen with its colours.
 * Below it, every app gets exactly one screen of its own.
 */
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { featured, products, studio } from '../../data/products'
import { ProductGlyph } from '../../media/ProductMedia'
import { BASE, ButtonLink, EASE, hueVars } from '../ui'
import { AppPose, AppSection } from './shared'

export default function LandingB() {
  const reduce = useReducedMotion()
  const [active, setActive] = useState(0)
  const [lit, setLit] = useState(false)
  const [slots, setSlots] = useState<Record<string, number>>({})
  const touched = useRef(false)
  const off = useRef(0)
  const product = products[active]

  // Once, on arrival: the screen runs through each app's colours, then settles back to paper.
  useEffect(() => {
    if (reduce) return
    const timers: number[] = []
    products.forEach((_, i) =>
      timers.push(
        window.setTimeout(() => {
          if (touched.current) return
          setActive(i)
          setLit(true)
        }, 900 + i * 520),
      ),
    )
    timers.push(
      window.setTimeout(() => {
        if (touched.current) return
        setLit(false)
        setActive(0)
      }, 900 + products.length * 520 + 260),
    )
    return () => timers.forEach(window.clearTimeout)
  }, [reduce])

  const point = (i: number) => {
    touched.current = true
    window.clearTimeout(off.current)
    setActive(i)
    setLit(true)
  }
  const leave = () => {
    window.clearTimeout(off.current)
    off.current = window.setTimeout(() => setLit(false), 420)
  }

  return (
    <>
      <section className="lb sp-immersive sp-immersive-field sp-snap" data-hue="" data-immersed={lit || undefined} style={hueVars(product)} aria-labelledby="lb-h">
        <div className="sp-wrap lb-main">
          <div className="lb-copy">
            <p className="sp-mono lb-kicker">
              <span className="sp-signal">{studio.name}</span>
              <span className="sp-mono-dim">Independent software studio</span>
            </p>
            <h1 id="lb-h" className="sp-display lb-h">
              Bring the problem.
              <br />
              <em>We build the software.</em>
            </h1>
            <p className="sp-lede">{studio.about} Our own are below, shown as they really are.</p>
            <div className="lb-cta">
              <ButtonLink to="/#contact" viewTransition={false}>
                Start a conversation
              </ButtonLink>
              <ButtonLink ghost to={`${BASE}/work`}>
                See all products
              </ButtonLink>
            </div>
          </div>
          <div className="lb-show" aria-hidden="true">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={product.slug}
                className="lb-show-item"
                initial={reduce ? false : { opacity: 0, y: 26, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -18, scale: 0.98 }}
                transition={reduce ? { duration: 0 } : { duration: 0.45, ease: EASE }}
              >
                <AppPose product={product} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="sp-wrap">
          <nav className="lb-strip" aria-label="Our products" onMouseLeave={leave} style={{ '--n': products.length } as CSSProperties}>
            {products.map((p, i) => (
              <a
                key={p.slug}
                href={`#${p.slug}`}
                data-hue=""
                data-on={(lit && i === active) || undefined}
                style={hueVars(p)}
                onMouseEnter={() => point(i)}
                onFocus={(e) => e.currentTarget.matches(':focus-visible') && point(i)}
                onBlur={leave}
                onClick={(e) => {
                  e.preventDefault()
                  touched.current = true
                  setLit(false)
                  document.getElementById(p.slug)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
                }}
              >
                <span className="lb-strip-top">
                  <span className="sp-mono">{p.discipline}</span>
                  <ProductGlyph motif={p.motif} size={20} />
                </span>
                <span className="lb-strip-name">{p.name}</span>
                <span className="sp-mono lb-strip-stage">{p.stageLabel}</span>
              </a>
            ))}
          </nav>
        </div>
      </section>

      {featured.map((p, i) => (
        <AppSection key={p.slug} product={p} slot={slots[p.slug] ?? 1} onSlot={(n) => setSlots((s) => ({ ...s, [p.slug]: n }))} flip={i % 2 === 1} />
      ))}
    </>
  )
}
