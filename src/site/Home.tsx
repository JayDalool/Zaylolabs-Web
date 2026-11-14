import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { products, studio, type Product } from '../data/products'
import { PhoneFrame, ProductGlyph, ProductMedia, WindowFrame } from '../media/ProductMedia'
import { Exploded } from './exploded/Exploded'
import { useImmerse } from './immerse'
import { pins, roman } from './showcase'
import { BASE, ButtonLink, DrawRule, EASE, Fig, FocusList, hueVars, Reveal, SectionHead, StageBadge, Tag } from './ui'

const bySlug = Object.fromEntries(products.map((p) => [p.slug, p])) as Record<string, Product>
const plateNo = (p: Product) => roman[products.indexOf(p)]

/* ——————————————————————————— hero ——————————————————————————— */

function Hero() {
  const ref = useRef<HTMLElement>(null)
  const sam = bySlug.samvisionai
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const explode = useTransform(scrollYProgress, [0, 0.85], [1, 0.12])

  return (
    <section ref={ref} className="sp-hero">
      <div className="sp-wrap sp-hero-grid">
        <div className="sp-hero-copy">
          <Reveal className="sp-hero-meta sp-mono">
            <span className="sp-signal">{studio.name}</span>
            <span className="sp-mono-dim">Independent software studio</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="sp-display">
              Software, built <em>layer by layer.</em>
            </h1>
          </Reveal>
          <Reveal delay={0.15} style={{ marginTop: 'clamp(1.4rem, 3vw, 2.4rem)' }}>
            <p className="sp-lede">
              {studio.about} Every product here is shown at its real stage: in development, internal, or prototype.
            </p>
          </Reveal>
          <Reveal delay={0.25} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.7rem', marginTop: 'clamp(1.6rem, 3vw, 2.6rem)' }}>
            <ButtonLink to={`${BASE}/work`}>See all products</ButtonLink>
            <ButtonLink ghost to={`${BASE}/work/samvisionai`}>
              Open SamVisionAI
            </ButtonLink>
          </Reveal>
        </div>
        <figure className="sp-hero-stage" data-hue="" style={hueVars(sam)}>
          <Exploded product={sam} surface="desktop" explode={explode} pins={pins.samvisionai} />
          <div style={{ position: 'absolute', left: 'calc(var(--gutter) * 0.6)', bottom: 0 }}>
            <Fig n="01">{sam.name}, exploded — scroll to assemble</Fig>
          </div>
        </figure>
      </div>
    </section>
  )
}

function IndexStrip() {
  return (
    <div className="sp-wrap">
      <nav className="sp-strip" aria-label="Product index">
        {products.map((p) => (
          <a
            key={p.slug}
            href={`#${p.slug}`}
            className="sp-immerse-hover"
            data-hue=""
            style={hueVars(p)}
            onClick={(e) => {
              e.preventDefault()
              document.getElementById(p.slug)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
          >
            <span className="sp-strip-top">
              <span className="sp-mono sp-strip-cat">{p.discipline}</span>
              <ProductGlyph motif={p.motif} size={22} />
            </span>
            <span className="sp-strip-name">{p.name}</span>
            <span className="sp-mono sp-mono-dim sp-strip-stage">{p.stageLabel}</span>
          </a>
        ))}
      </nav>
    </div>
  )
}

/* ——————————————————————————— plates ——————————————————————————— */

function Plate({ product, children, dark }: { product: Product; children: ReactNode; dark?: boolean }) {
  // The plate takes on the app's own colours while the visitor is in it.
  const { ref, on } = useImmerse<HTMLElement>()
  return (
    <section
      ref={ref}
      id={product.slug}
      className={`sp-plate sp-immersive sp-immersive-field ${dark ? 'sp-dark' : ''}`}
      data-hue=""
      data-immersed={on || undefined}
      style={{ ...hueVars(product), scrollMarginTop: '4rem' }}
      aria-labelledby={`${product.slug}-name`}
    >
      <div className="sp-wrap">
        <div className="sp-plate-head">
          <span className="sp-plate-no">Plate {plateNo(product)}</span>
          <span className="sp-mono sp-mono-dim">{product.catalog}</span>
          <DrawRule />
          <Tag>{product.discipline}</Tag>
          <StageBadge product={product} />
          <span className="sp-plate-avail">{product.availability}</span>
        </div>
        {children}
      </div>
    </section>
  )
}

function PlateName({ product, size }: { product: Product; size?: string }) {
  return (
    <Reveal>
      <h2 id={`${product.slug}-name`} className="sp-name sp-plate-name" style={size ? { fontSize: size } : undefined}>
        {product.name}
        {product.alias && <small>/ {product.alias}</small>}
      </h2>
    </Reveal>
  )
}

function SpecimenLink({ product, label }: { product: Product; label?: string }) {
  return (
    <ButtonLink ghost to={`${BASE}/work/${product.slug}`}>
      {label ?? `Open ${product.name}`}
    </ButtonLink>
  )
}

/** I — SamVisionAI: annotated desktop capture that settles flat as it arrives. */
function PlateSam() {
  const p = bySlug.samvisionai
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [active, setActive] = useState<number | null>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] })
  const rotateX = useTransform(scrollYProgress, [0, 1], [22, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1])
  const phoneY = useTransform(scrollYProgress, [0, 1], [90, 0])

  return (
    <Plate product={p}>
      <PlateName product={p} />
      <div className="sp-grid" style={{ rowGap: '2.5rem', marginTop: 'clamp(1.8rem, 4vw, 3.5rem)', alignItems: 'start' }}>
        <Reveal className="col-span-12 lg:col-span-4" style={{ display: 'grid', gap: '1.4rem' }}>
          <h3 className="sp-h3">{p.tagline}</h3>
          <p className="sp-body">{p.summary}</p>
          <FocusList product={p} active={active} onActive={setActive} />
          <div>
            <SpecimenLink product={p} />
          </div>
        </Reveal>
        <div ref={ref} className="col-span-12 lg:col-span-8 sp-p1-media">
          <motion.div style={reduce ? undefined : { rotateX, scale, transformOrigin: '50% 100%' }}>
            <WindowFrame title={`${p.name} — desktop`}>
              <div className="sp-annot">
                <ProductMedia product={p} surface="desktop" slot={1} />
                {pins.samvisionai.map((pin, i) => (
                  <button
                    key={i}
                    className={`sp-pin ${active === i ? 'is-active' : ''}`}
                    style={{ left: `${pin.x * 100}%`, top: `${pin.y * 100}%` }}
                    aria-label={`${i + 1}: ${p.focus[i].title} — ${p.focus[i].note}`}
                    onMouseEnter={() => setActive(i)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </WindowFrame>
          </motion.div>
          <motion.div className="sp-p1-phone" style={reduce ? undefined : { y: phoneY }}>
            <PhoneFrame>
              <ProductMedia product={p} surface="mobile" />
            </PhoneFrame>
          </motion.div>
          <div style={{ marginTop: '1.2rem' }}>
            <Fig n="02">Annotated capture — pick a number or a row</Fig>
          </div>
        </div>
      </div>
    </Plate>
  )
}

/** II — MyFamilyExpenses: phone-first, with the focus areas printed as a receipt. */
function PlateFamily() {
  const p = bySlug.myfamilyexpenses
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 60%'] })
  const clip = useTransform(scrollYProgress, [0, 1], ['inset(0 0 100% 0)', 'inset(0 0 -4% 0)'])
  const phoneY = useTransform(scrollYProgress, [0, 1], [50, -20])

  return (
    <Plate product={p}>
      <div className="sp-grid" style={{ rowGap: '3rem', alignItems: 'center' }}>
        <div className="col-span-12 md:col-span-5" style={{ position: 'relative', display: 'grid', placeItems: 'center', minHeight: 'clamp(26rem, 60vw, 40rem)' }}>
          <div className="sp-wash" style={{ inset: '8% 6% 8% 6%' }} />
          <motion.div style={{ position: 'relative', zIndex: 1, width: 'min(58%, 17rem)', ...(reduce ? {} : { y: phoneY }) }}>
            <PhoneFrame>
              <ProductMedia product={p} surface="mobile" />
            </PhoneFrame>
          </motion.div>
        </div>
        <div className="col-span-12 max-md:order-first md:col-span-6 md:col-start-7" style={{ display: 'grid', gap: '1.6rem' }}>
          <PlateName product={p} size="clamp(2.5rem, 6vw, 5.6rem)" />
          <Reveal>
            <h3 className="sp-h3">{p.tagline}</h3>
          </Reveal>
          <div ref={ref}>
            <motion.div className="sp-receipt" style={reduce ? undefined : { clipPath: clip }}>
              <div className="sp-receipt-row">
                <span>{p.name}</span>
                <span>{p.catalog}</span>
              </div>
              <hr />
              {p.focus.map((f, i) => (
                <div key={f.title}>
                  <div className="sp-receipt-row">
                    <span>{f.title}</span>
                    <span>{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <p>{f.note}</p>
                </div>
              ))}
              <hr />
              <div className="sp-receipt-row">
                <span>Stage</span>
                <span>{p.stageLabel}</span>
              </div>
              <div className="sp-receipt-row">
                <span>Surfaces</span>
                <span>{p.surfaces.join(' + ')}</span>
              </div>
            </motion.div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <SpecimenLink product={p} />
          </div>
        </div>
      </div>
    </Plate>
  )
}

/** III — GYST: focus areas as tabs that swap the capture slot. */
function PlateGyst() {
  const p = bySlug.gyst
  const [tab, setTab] = useState(0)
  const reduce = useReducedMotion()
  return (
    <Plate product={p}>
      <div className="sp-grid" style={{ rowGap: '1.5rem', alignItems: 'end' }}>
        <div className="col-span-12 lg:col-span-7">
          <PlateName product={p} />
        </div>
        <Reveal className="col-span-12 lg:col-span-5" style={{ display: 'grid', gap: '0.8rem' }}>
          <h3 className="sp-h3">{p.tagline}</h3>
          <p className="sp-body">{p.summary}</p>
        </Reveal>
      </div>
      <div style={{ marginTop: 'clamp(2rem, 4vw, 3.5rem)', display: 'grid', gap: '1.2rem' }}>
        <div className="sp-week" aria-hidden="true">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
            <span key={d} className={i === 2 ? 'is-today' : ''}>
              {d}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem 2rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="sp-tabs" role="tablist" aria-label={`${p.name} focus areas`} style={{ isolation: 'isolate' }}>
            {p.focus.map((f, i) => (
              <button key={f.title} role="tab" id={`gyst-tab-${i}`} aria-selected={tab === i} aria-controls="gyst-panel" tabIndex={tab === i ? 0 : -1} onClick={() => setTab(i)}
                onKeyDown={(e) => {
                  const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
                  if (!d) return
                  const n = (tab + d + p.focus.length) % p.focus.length
                  setTab(n)
                  document.getElementById(`gyst-tab-${n}`)?.focus()
                }}
              >
                {tab === i && <motion.span layoutId="gyst-ind" className="sp-tab-ind" transition={reduce ? { duration: 0 } : { duration: 0.45, ease: EASE }} />}
                {f.title}
              </button>
            ))}
          </div>
          <p className="sp-body" style={{ maxWidth: '26em' }} aria-live="polite">
            {p.focus[tab].note}
          </p>
        </div>
        <div id="gyst-panel" role="tabpanel" aria-labelledby={`gyst-tab-${tab}`}>
          <WindowFrame title={`${p.name} — ${p.focus[tab].title}`}>
            <div style={{ position: 'relative' }}>
              <ProductMedia product={p} surface="desktop" slot={1} style={{ visibility: 'hidden' }} />
              <AnimatePresence initial={false}>
                <motion.div
                  key={tab}
                  style={{ position: 'absolute', inset: 0 }}
                  initial={reduce ? false : { opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
                  animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 0.7, ease: EASE }}
                >
                  <ProductMedia product={p} surface="desktop" slot={tab + 1} label={p.focus[tab].title} />
                </motion.div>
              </AnimatePresence>
            </div>
          </WindowFrame>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
          <Fig n="03">One capture slot per focus area</Fig>
          <SpecimenLink product={p} />
        </div>
      </div>
    </Plate>
  )
}

/** IV — CommandCenter: internal, so the interface is deliberately withheld. */
function PlateCommand() {
  const p = bySlug.commandcenter
  return (
    <Plate product={p} dark>
      <div className="sp-grid" style={{ rowGap: '2.5rem', alignItems: 'center' }}>
        <div className="col-span-12 lg:col-span-5" style={{ display: 'grid', gap: '1.3rem' }}>
          <PlateName product={p} size="clamp(2.5rem, 6.4vw, 5.8rem)" />
          <Reveal style={{ display: 'grid', gap: '1rem' }}>
            <h3 className="sp-h3">{p.tagline}</h3>
            <p className="sp-body">{p.summary}</p>
            <div>
              <SpecimenLink product={p} />
            </div>
          </Reveal>
        </div>
        <Reveal className="col-span-12 lg:col-span-7">
          <WindowFrame title={`${p.name} — internal`} className="sp-restricted">
            <ProductMedia product={p} surface="desktop" />
            <p className="sp-restricted-note" style={{ margin: 0 }}>
              <span className="sp-signal">Restricted</span>
              <br />
              {p.caution}
            </p>
          </WindowFrame>
        </Reveal>
        <Reveal className="col-span-12">
          <ol className="sp-nodes">
            {p.focus.map((f) => (
              <li key={f.title}>
                <b>{f.title}</b>
                <span>{f.note}</span>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </Plate>
  )
}

/** V — GauzeMate: a prototype, shown small and labelled as one. */
function PlateGauze() {
  const p = bySlug.gauzemate
  return (
    <Plate product={p}>
      <div className="sp-grid" style={{ rowGap: '3rem', alignItems: 'center' }}>
        <div className="col-span-12 md:col-span-6 lg:col-span-5 lg:col-start-2" style={{ display: 'grid', gap: '1.3rem' }}>
          <PlateName product={p} size="clamp(2.3rem, 5.2vw, 4.6rem)" />
          <Reveal style={{ display: 'grid', gap: '1.1rem' }}>
            <h3 className="sp-h3">{p.tagline}</h3>
            <FocusList product={p} />
            <p className="sp-mono" style={{ margin: 0, padding: '0.8rem 0.9rem', border: '1px dashed var(--hue-ink)', color: 'var(--hue-ink)', lineHeight: 1.7 }}>
              {p.caution}
            </p>
            <div>
              <SpecimenLink product={p} />
            </div>
          </Reveal>
        </div>
        <Reveal className="col-span-12 md:col-span-6 lg:col-span-5 lg:col-start-8" style={{ padding: '1.2rem' }}>
          <div className="sp-dish">
            <PhoneFrame>
              <ProductMedia product={p} surface="mobile" />
            </PhoneFrame>
          </div>
        </Reveal>
      </div>
    </Plate>
  )
}

/* ——————————————————————————— studio ——————————————————————————— */

function Practice() {
  return (
    <section id="studio" className="sp-section" style={{ scrollMarginTop: '4rem' }} aria-labelledby="practice-h">
      <div className="sp-wrap">
        <SectionHead
          label="Practice"
          title={
            <span id="practice-h">
              What the lab <em>builds.</em>
            </span>
          }
        />
        <Reveal>
          <ol className="sp-practice">
            {studio.practice.map((s, i) => (
              <li key={s.title}>
                <span className="sp-mono sp-signal">{String(i + 1).padStart(2, '0')}</span>
                <h3>{s.title}</h3>
                <p>{s.note}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  )
}

const RULES = [
  {
    title: 'Real interfaces only',
    body: 'Every image here is either a genuine capture of working software or a placeholder marked as one. No invented mockups.',
  },
  {
    title: 'Status, stated plainly',
    body: 'In development, internal and prototype mean exactly that. Nothing is presented as more finished or more available than it is.',
  },
  {
    title: 'Private stays private',
    body: 'No customer information, credentials or internal operational detail appears in any capture.',
  },
]

function Rules() {
  return (
    <section className="sp-section sp-dark" style={{ borderTop: 0 }} aria-labelledby="rules-h">
      <div className="sp-wrap">
        <SectionHead
          label="House rules"
          title={
            <span id="rules-h">
              Three rules for everything <em>shown here.</em>
            </span>
          }
        />
        <div className="sp-rules">
          {RULES.map((r, i) => (
            <Reveal key={r.title} delay={i * 0.08}>
              <article>
                <p className="sp-mono sp-signal" style={{ margin: '0 0 1.4rem' }}>
                  Rule {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="sp-h3" style={{ marginBottom: '0.7rem' }}>
                  {r.title}
                </h3>
                <p className="sp-body">{r.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="sp-section" style={{ borderTop: 0, scrollMarginTop: '4rem' }} aria-labelledby="contact-h">
      <div className="sp-wrap sp-grid" style={{ rowGap: '2rem', alignItems: 'end' }}>
        <div className="col-span-12 lg:col-span-8">
          <p className="sp-mono sp-signal" style={{ margin: '0 0 1.5rem' }}>
            Contact
          </p>
          <h2 id="contact-h" className="sp-display" style={{ fontSize: 'clamp(2.8rem, 8vw, 8rem)' }}>
            Have a problem worth <em>building for?</em>
          </h2>
        </div>
        <div className="col-span-12 lg:col-span-4" style={{ display: 'grid', gap: '1.2rem' }}>
          <p className="sp-body">
            Alongside its own products, ZayloLabs is preparing to take on custom software development: applications, AI-powered tools and business automation.
          </p>
          {studio.contactEmail ? (
            <a className="sp-btn" href={`mailto:${studio.contactEmail}`} style={{ width: 'fit-content' }}>
              {studio.contactEmail}
            </a>
          ) : (
            <p className="sp-mono" style={{ margin: 0, padding: '0.9rem 1rem', border: '1px dashed var(--rule-2)', lineHeight: 1.7 }}>
              <span className="sp-signal">Prototype</span> — contact channel is wired in at launch.
              <br />
              <span className="sp-mono-dim">{studio.domain}</span>
            </p>
          )}
          <Link className="sp-link" to={`${BASE}/work`} viewTransition style={{ width: 'fit-content' }}>
            Or see all products first
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <Hero />
      <IndexStrip />
      <div style={{ height: 'clamp(2rem, 5vw, 4rem)' }} />
      <PlateSam />
      <PlateFamily />
      <PlateGyst />
      <PlateCommand />
      <PlateGauze />
      <Practice />
      <Rules />
      <Contact />
    </>
  )
}
