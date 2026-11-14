import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { products, stages, type Product, type Stage } from '../data/products'
import { PhoneFrame, ProductGlyph, ProductMedia, WindowFrame } from '../media/ProductMedia'
import { useIsCoarsePointer } from '../shared/env'
import { BASE, ButtonLink, EASE, FocusList, hueVars, Reveal, StageBadge, Tag } from './ui'

const words = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve']
const STEP = 30 // px each card behind the front one rises

function Media({ product, active }: { product: Product; active?: boolean }) {
  const style = active ? { viewTransitionName: 'specimen-media' } : undefined
  return product.primarySurface === 'desktop' ? (
    <WindowFrame title={`${product.name} — desktop`} style={style}>
      <ProductMedia product={product} surface="desktop" />
    </WindowFrame>
  ) : (
    <PhoneFrame style={style}>
      <ProductMedia product={product} surface="mobile" />
    </PhoneFrame>
  )
}

/** Index-card drawer: every card keeps its tab visible; the chosen one comes to the front. */
function Drawer({ list }: { list: Product[] }) {
  const [active, setActive] = useState(0)
  // The front card takes its app's colours: under the pointer on a mouse, always on touch.
  const [hot, setHot] = useState(false)
  const coarse = useIsCoarsePointer()
  const reduce = useReducedMotion()
  const n = list.length
  useEffect(() => setActive(0), [list])
  const go = (d: number) => setActive((a) => (a + d + n) % n)
  const current = list[Math.min(active, n - 1)]

  return (
    <div>
      <div
        className="sp-drawer"
        role="group"
        aria-roledescription="carousel"
        aria-label="Product drawer"
        style={{ marginTop: (n - 1) * STEP + 52 }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') go(1)
          if (e.key === 'ArrowLeft') go(-1)
        }}
      >
        {list.map((p, i) => {
          const rel = (i - active + n) % n
          const front = rel === 0
          return (
            <motion.article
              key={p.slug}
              className="sp-card sp-immersive"
              data-hue=""
              data-immersed={(front && (hot || coarse)) || undefined}
              onPointerMove={(e) => front && !hot && e.pointerType === 'mouse' && setHot(true)}
              onPointerLeave={() => setHot(false)}
              data-first={i === 0}
              style={{ ...hueVars(p), '--card-base': `color-mix(in srgb, ${p.hue.wash} 28%, #f8f5ee)`, zIndex: n - rel } as React.CSSProperties}
              initial={false}
              animate={{ y: -rel * STEP, scale: 1 - rel * 0.03 }}
              transition={reduce ? { duration: 0 } : { duration: 0.7, ease: EASE }}
              drag={front && n > 1 ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              dragSnapToOrigin
              onDragEnd={(_, info) => {
                if (info.offset.x < -70) go(1)
                else if (info.offset.x > 70) go(-1)
              }}
              aria-roledescription="slide"
              aria-label={`${p.name} — ${i + 1} of ${n}`}
            >
              <button
                className="sp-card-tab"
                style={{ left: `${(i / n) * 100}%`, width: `calc(${100 / n}% + 1px)` }}
                onClick={() => setActive(i)}
                aria-pressed={front}
                aria-label={`Bring ${p.name} to the front`}
              >
                <ProductGlyph motif={p.motif} size={15} />
                <span>{p.catalog}</span>
                <span className="sp-card-tab-name sp-mono-dim">{p.name}</span>
              </button>
              <div className="sp-card-body" inert={!front}>
                <div className="sp-card-copy">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <Tag>{p.discipline}</Tag>
                    <StageBadge product={p} />
                  </div>
                  <h2 className="sp-name" style={{ fontSize: 'clamp(2.1rem, 4.4vw, 4.2rem)', overflowWrap: 'anywhere' }}>
                    {p.name}
                  </h2>
                  <p className="sp-h3" style={{ fontSize: 'clamp(1.1rem, 1.6vw, 1.45rem)' }}>
                    {p.tagline}
                  </p>
                  <p className="sp-body sp-card-summary" style={{ fontSize: '0.95rem' }}>
                    {p.summary}
                  </p>
                  <div className="sp-card-summary" style={{ fontSize: '0.92rem' }}>
                    <FocusList product={{ ...p, focus: p.focus.slice(0, 3) }} />
                  </div>
                  <div style={{ marginTop: 'auto', paddingTop: '0.4rem' }}>
                    <ButtonLink to={`${BASE}/work/${p.slug}`}>Open {p.name}</ButtonLink>
                  </div>
                </div>
                <div className="sp-card-media">
                  <Media product={p} active={front} />
                </div>
              </div>
            </motion.article>
          )
        })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginTop: '1.2rem' }}>
        <p className="sp-mono" style={{ margin: 0 }} aria-live="polite">
          <span className="sp-signal">{String(active + 1).padStart(2, '0')}</span> / {String(n).padStart(2, '0')} <span className="sp-mono-dim">— {current?.name}</span>
        </p>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button className="sp-chip" onClick={() => go(-1)} disabled={n < 2} aria-label="Previous product">
            ← Prev
          </button>
          <button className="sp-chip" onClick={() => go(1)} disabled={n < 2} aria-label="Next product">
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}

/** Index table with a capture that follows the cursor on fine pointers. */
function Index({ list }: { list: Product[] }) {
  const [peek, setPeek] = useState<Product | null>(null)
  const coarse = useIsCoarsePointer()
  const reduce = useReducedMotion()
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 260, damping: 30 })
  const y = useSpring(my, { stiffness: 260, damping: 30 })

  return (
    <div
      onMouseMove={(e) => {
        mx.set(e.clientX + 28)
        my.set(e.clientY - 90)
        if (!peek) {
          // first appearance: start at the cursor instead of springing in from the corner
          x.jump(e.clientX + 28)
          y.jump(e.clientY - 90)
        }
      }}
      onMouseLeave={() => setPeek(null)}
    >
      <table className="sp-table">
        <thead>
          <tr>
            <th scope="col">No.</th>
            <th scope="col">Product</th>
            <th scope="col" className="sp-hide-s">
              What it is
            </th>
            <th scope="col" className="sp-hide-s">
              Surfaces
            </th>
            <th scope="col">Stage</th>
          </tr>
        </thead>
        <tbody>
          {list.map((p) => (
            <tr key={p.slug} className="sp-immerse-hover" data-hue="" style={hueVars(p)} onMouseEnter={() => setPeek(p)}>
              <td className="sp-mono sp-mono-dim" style={{ width: '5.5rem' }}>
                {p.catalog}
              </td>
              <td>
                <Link className="sp-row-name" to={`${BASE}/work/${p.slug}`} viewTransition onFocus={() => setPeek(null)}>
                  {p.name}
                </Link>
              </td>
              <td className="sp-hide-s" style={{ color: 'var(--ink-2)', fontSize: '0.95rem' }}>
                {p.discipline}
              </td>
              <td className="sp-hide-s sp-mono sp-mono-dim">{p.surfaces.join(' + ')}</td>
              <td>
                <StageBadge product={p} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <AnimatePresence>
        {peek && !coarse && (
          <motion.div
            key={peek.slug}
            className="sp-peek"
            data-hue=""
            style={{ ...hueVars(peek), x, y } as never}
            initial={reduce ? false : { opacity: 0, scale: 0.92, rotate: -3 }}
            animate={{ opacity: 1, scale: 1, rotate: -2 }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
            transition={{ duration: 0.3, ease: EASE }}
            aria-hidden="true"
          >
            <WindowFrame title={peek.name}>
              <ProductMedia product={peek} surface="desktop" />
            </WindowFrame>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Catalogue() {
  const [stage, setStage] = useState<Stage | 'all'>('all')
  // Small screens start on the named list: the drawer's tabs only have room for catalogue numbers there.
  const [view, setView] = useState<'drawer' | 'index'>(() => (window.matchMedia('(max-width: 640px)').matches ? 'index' : 'drawer'))
  const list = useMemo(() => products.filter((p) => stage === 'all' || p.stage === stage), [stage])

  return (
    <div className="sp-wrap" style={{ paddingBlock: 'clamp(2rem, 5vw, 4.5rem) clamp(4rem, 8vw, 7rem)' }}>
      <Reveal>
        <p className="sp-mono sp-signal" style={{ margin: '0 0 1.2rem' }}>
          Products
        </p>
        <h1 className="sp-display" style={{ fontSize: 'clamp(2.8rem, 8vw, 8rem)' }}>
          {words[products.length] ?? products.length} products, <em>one drawer.</em>
        </h1>
      </Reveal>
      <Reveal delay={0.1} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem 2rem', justifyContent: 'space-between', alignItems: 'center', marginTop: 'clamp(1.6rem, 4vw, 3rem)' }}>
        <div className="sp-chips" role="group" aria-label="Filter by stage">
          <button className="sp-chip" aria-pressed={stage === 'all'} onClick={() => setStage('all')}>
            All <sup>{products.length}</sup>
          </button>
          {stages.map((s) => (
            <button key={s.id} className="sp-chip" aria-pressed={stage === s.id} onClick={() => setStage(s.id)} title={s.blurb}>
              {s.label} <sup>{products.filter((p) => p.stage === s.id).length}</sup>
            </button>
          ))}
        </div>
        <div className="sp-seg" role="group" aria-label="View">
          <button aria-pressed={view === 'drawer'} onClick={() => setView('drawer')}>
            Drawer
          </button>
          <button aria-pressed={view === 'index'} onClick={() => setView('index')}>
            Index
          </button>
        </div>
      </Reveal>
      <p className="sp-mono sp-mono-dim" style={{ margin: '1.2rem 0 0' }}>
        {stage === 'all' ? 'Every product, with its actual stage.' : stages.find((s) => s.id === stage)?.blurb}
      </p>

      {view === 'drawer' ? (
        <Drawer list={list} />
      ) : (
        <div style={{ marginTop: '2.5rem' }}>
          <Index list={list} />
        </div>
      )}
    </div>
  )
}
