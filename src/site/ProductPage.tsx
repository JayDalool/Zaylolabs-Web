/**
 * Specimen record — the reusable product page.
 *
 * Every product gets: header + record, an explodable bench, focus areas,
 * surfaces and a status block. Optional sections (annotated capture, workflow
 * tour) switch on when `showcase.ts` has data for the product, so a new
 * product page costs one catalogue entry and a folder of captures.
 */
import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { productBySlug, products, type Product } from '../data/products'
import { hasRealMedia } from '../media/manifest'
import { PhoneFrame, ProductMedia, ProductVideo, WindowFrame } from '../media/ProductMedia'
import { ZoomDialog } from '../media/ZoomDialog'
import { Exploded } from './exploded/Exploded'
import { LAYERS } from './exploded/layers'
import { pins as allPins, tours, tourTitles } from './showcase'
import { BASE, Fig, FocusList, hueVars, Reveal, SectionHead, StageBadge, Tag } from './ui'
import { useImmerse } from './immerse'

function ZoomButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="sp-zoom-btn" onClick={onClick} aria-label="Open zoomable view">
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
        <circle cx="5" cy="5" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M8 8l3 3" stroke="currentColor" strokeWidth="1.2" />
      </svg>
      Zoom
    </button>
  )
}

/* ——— sections ——— */

function Bench({ product }: { product: Product }) {
  const [explode, setExplode] = useState(1)
  const [front, setFront] = useState(false)
  const [isolate, setIsolate] = useState<number | null>(null)
  const pins = allPins[product.slug]
  return (
    <figure style={{ margin: 0 }}>
      <div className="sp-bench" style={{ viewTransitionName: 'specimen-media' }}>
        <div className="sp-bench-stage">
          <Exploded product={product} explode={explode} flatten={front ? 1 : 0} pins={pins} isolate={isolate} />
        </div>
        <div className="sp-bench-bar">
          <label className="sp-range">
            <span className="sp-mono">Explode</span>
            <input type="range" min={0} max={1} step={0.01} value={explode} onChange={(e) => setExplode(+e.target.value)} aria-valuetext={`${Math.round(explode * 100)} percent`} />
            <span className="sp-mono sp-mono-dim" style={{ width: '2.6rem', textAlign: 'right' }}>
              {Math.round(explode * 100)}%
            </span>
          </label>
          <div className="sp-seg" role="group" aria-label="Projection">
            <button aria-pressed={!front} onClick={() => setFront(false)}>
              Axonometric
            </button>
            <button aria-pressed={front} onClick={() => setFront(true)}>
              Front
            </button>
          </div>
          <div className="sp-seg" role="group" aria-label="Isolate layer">
            <button aria-pressed={isolate === null} onClick={() => setIsolate(null)}>
              All
            </button>
            {LAYERS.map((l, i) => (
              <button key={l.id} aria-pressed={isolate === i} onClick={() => setIsolate(isolate === i ? null : i)} aria-label={`Isolate ${l.name} layer`}>
                {l.id}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ marginTop: '0.9rem' }}>
        <Fig n="A">{product.name} on the bench — drag the slider, switch projection, isolate a layer</Fig>
      </div>
    </figure>
  )
}

function Annotated({ product }: { product: Product }) {
  const pins = allPins[product.slug]
  const [active, setActive] = useState<number | null>(null)
  const [zoom, setZoom] = useState(false)
  const surface = product.primarySurface
  const media = (
    <div className="sp-annot">
      <ProductMedia product={product} surface={surface} slot={1} />
      {pins?.map((pin, i) => (
        <button
          key={i}
          className={`sp-pin ${active === i ? 'is-active' : ''}`}
          style={{ left: `${pin.x * 100}%`, top: `${pin.y * 100}%` }}
          aria-label={`${i + 1}: ${product.focus[i].title} — ${product.focus[i].note}`}
          onMouseEnter={() => setActive(i)}
          onMouseLeave={() => setActive(null)}
          onFocus={() => setActive(i)}
          onBlur={() => setActive(null)}
        >
          {i + 1}
        </button>
      ))}
      <ZoomButton onClick={() => setZoom(true)} />
    </div>
  )
  return (
    <div className="sp-grid" style={{ rowGap: '2.5rem', alignItems: 'start' }}>
      <div className="col-span-12 lg:col-span-4">
        <FocusList product={product} active={active} onActive={pins ? setActive : undefined} />
      </div>
      <Reveal className={surface === 'desktop' ? 'col-span-12 lg:col-span-8' : 'col-span-8 col-start-3 sm:col-span-6 sm:col-start-4 lg:col-span-3 lg:col-start-8'}>
        {surface === 'desktop' ? <WindowFrame title={`${product.name} — ${surface}`}>{media}</WindowFrame> : <PhoneFrame>{media}</PhoneFrame>}
      </Reveal>
      {zoom && <ZoomDialog product={product} surface={surface} slot={1} onClose={() => setZoom(false)} />}
    </div>
  )
}

function Tour({ product }: { product: Product }) {
  const steps = tours[product.slug]
  const [active, setActive] = useState(0)
  const [zoom, setZoom] = useState(false)
  const refs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i))
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    refs.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <div className="sp-tour">
      <div className="sp-tour-media">
        <WindowFrame title={`${product.name} — ${steps[active].slotLabel}`}>
          <div style={{ position: 'relative' }}>
            <div className="sp-tour-stack">
              {steps.map((s, i) => (
                <div key={s.slot} aria-hidden={i !== active}>
                  <ProductMedia product={product} surface="desktop" slot={s.slot} label={s.slotLabel} />
                </div>
              ))}
            </div>
            <ZoomButton onClick={() => setZoom(true)} />
          </div>
        </WindowFrame>
        <div className="sp-mono" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem', alignItems: 'center' }}>
          {steps.map((s, i) => (
            <button
              key={s.slot}
              onClick={() => refs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              aria-label={`Go to step ${i + 1}: ${s.slotLabel}`}
              aria-current={i === active ? 'step' : undefined}
              style={{ flex: 1, height: '1.6rem', padding: 0, border: 0, background: 'none', cursor: 'pointer' }}
            >
              <span style={{ display: 'block', height: i === active ? 3 : 1, background: i === active ? 'var(--hue-ink)' : 'var(--rule-2)', transition: 'height .2s, background .2s' }} />
            </button>
          ))}
        </div>
      </div>
      <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {steps.map((s, i) => (
          <li key={s.slot} ref={(el) => void (refs.current[i] = el)} data-i={i} className={`sp-tour-step ${i === active ? 'is-active' : ''}`}>
            <span className="sp-mono" style={{ color: 'var(--hue-ink)' }}>
              Step {String(i + 1).padStart(2, '0')} — {product.focus[s.focus].title}
            </span>
            <h3 className="sp-h3">{s.heading}</h3>
            <p className="sp-body">{product.focus[s.focus].note}</p>
          </li>
        ))}
      </ol>
      {zoom && <ZoomDialog product={product} surface="desktop" slot={steps[active].slot} label={steps[active].slotLabel} onClose={() => setZoom(false)} />}
    </div>
  )
}

function Surfaces({ product }: { product: Product }) {
  const desktop = product.surfaces.includes('desktop')
  const mobile = product.surfaces.includes('mobile')
  return (
    <div style={{ display: 'grid', gap: 'clamp(2rem, 4vw, 4rem)' }}>
      <div className="sp-surfaces" style={!desktop || !mobile ? { gridTemplateColumns: 'minmax(0, 1fr)' } : undefined}>
        {desktop && (
          <Reveal>
            <WindowFrame title={`${product.name} — desktop`}>
              <ProductMedia product={product} surface="desktop" slot={2} />
            </WindowFrame>
            <div style={{ marginTop: '0.8rem' }}>
              <Fig n="C">Desktop surface</Fig>
            </div>
          </Reveal>
        )}
        {mobile && (
          <Reveal delay={0.1} style={{ width: '100%', maxWidth: desktop ? undefined : '18rem', minWidth: 0, justifySelf: desktop ? undefined : 'start' }}>
            <div style={{ maxWidth: '16rem' }}>
              <PhoneFrame>
                <ProductMedia product={product} surface="mobile" slot={1} />
              </PhoneFrame>
            </div>
            <div style={{ marginTop: '0.8rem' }}>
              <Fig n="D">Mobile surface</Fig>
            </div>
          </Reveal>
        )}
      </div>
      <Reveal>
        <div style={{ border: '1px solid var(--ink)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <ProductVideo product={product} label="interface walkthrough" />
        </div>
        <div style={{ marginTop: '0.8rem' }}>
          <Fig n="E">Interface video</Fig>
        </div>
      </Reveal>
    </div>
  )
}

function Record({ product }: { product: Product }) {
  const real = hasRealMedia(product.slug)
  const rows: [string, string][] = [
    ['Stage', product.stageLabel],
    ['Availability', product.availability],
    ['Surfaces', product.surfaces.join(' + ')],
    ['Captures on this page', real ? 'Genuine application captures. Empty slots are marked placeholders.' : 'Placeholder schematics only — no real capture has been added yet.'],
    ['Data shown', 'No customer information, credentials or internal operational detail.'],
  ]
  if (product.caution) rows.push(['Note', product.caution])
  return (
    <dl style={{ margin: 0, borderTop: '1px solid var(--ink)' }}>
      {rows.map(([k, v]) => (
        <div key={k} className="sp-grid" style={{ padding: '1rem 0', borderBottom: '1px solid var(--rule)', rowGap: '0.3rem' }}>
          <dt className="sp-mono sp-mono-dim col-span-12 md:col-span-3">{k}</dt>
          <dd className="col-span-12 md:col-span-9" style={{ margin: 0, maxWidth: '44em' }}>
            {v}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export default function ProductPage() {
  const { slug } = useParams()
  const product = productBySlug(slug)
  useEffect(() => {
    if (product) document.title = `${product.name} — ZayloLabs (prototype)`
    return () => void (document.title = 'ZayloLabs — design prototype')
  }, [product])

  if (!product) {
    return (
      <div className="sp-wrap" style={{ paddingBlock: '6rem', minHeight: '60vh' }}>
        <h1 className="sp-h2">No specimen under that number.</h1>
        <p className="sp-body" style={{ marginTop: '1rem' }}>
          <Link className="sp-link" to={`${BASE}/work`}>
            Back to all products
          </Link>
        </p>
      </div>
    )
  }

  const next = products[(products.indexOf(product) + 1) % products.length]
  const hasTour = !!tours[product.slug]
  // An app's own page is in that app's colours throughout; the hook only tracks the pointer for the light.
  const { ref } = useImmerse<HTMLElement>()

  return (
    <article key={product.slug} ref={ref} className="sp-immersive sp-immersive-field sp-product" data-hue="" data-immersed="" style={hueVars(product)}>
      <header className="sp-wrap" style={{ paddingBlock: 'clamp(1.5rem, 4vw, 3.5rem) clamp(2rem, 4vw, 3.5rem)' }}>
        <nav aria-label="Breadcrumb" className="sp-mono" style={{ display: 'flex', gap: '0.6rem', marginBottom: 'clamp(1.5rem, 4vw, 3rem)' }}>
          <Link className="sp-link" to={`${BASE}/work`} viewTransition>
            Products
          </Link>
          <span className="sp-mono-dim">/</span>
          <span style={{ color: 'var(--hue-ink)' }}>{product.name}</span>
        </nav>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.2rem' }}>
          <Tag>{product.discipline}</Tag>
          <StageBadge product={product} />
        </div>
        <h1 className="sp-name" style={{ fontSize: `min(12.5rem, 12.5vw, ${(150 / product.name.length).toFixed(2)}vw)`, overflowWrap: 'anywhere' }}>
          {product.name}
        </h1>
        <div className="sp-grid" style={{ marginTop: 'clamp(1.5rem, 3vw, 2.6rem)', rowGap: '1rem' }}>
          <p className="sp-h3 col-span-12 lg:col-span-5" style={{ fontSize: 'clamp(1.4rem, 2.4vw, 2.2rem)', fontWeight: 380 }}>
            {product.tagline}
          </p>
          <p className="sp-lede col-span-12 lg:col-span-6 lg:col-start-7">{product.summary}</p>
        </div>
      </header>

      <div className="sp-wrap">
        {/* The plain facts come before anything to look at. */}
        <dl className="sp-meta" style={{ marginBottom: 'clamp(1.6rem, 3vw, 2.6rem)' }}>
          {(
            [
              ['What it is', product.discipline],
              ['Stage', product.stageLabel],
              ['Availability', product.availability],
              ['Made for', product.surfaces.map((x) => (x === 'mobile' ? 'phone' : x)).map((x, i) => (i ? x : x[0].toUpperCase() + x.slice(1))).join(' and ')],
            ] as const
          ).map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <Bench product={product} />
      </div>

      <section className="sp-section" style={{ borderTop: 0 }} aria-labelledby="focus-h">
        <div className="sp-wrap">
          <SectionHead
            label="Focus"
            title={
              <span id="focus-h">
                What it <em>covers.</em>
              </span>
            }
          />
          <Annotated product={product} />
          <div style={{ marginTop: '1.2rem' }}>
            <Fig n="B">{allPins[product.slug] ? 'Annotated capture — numbers match the list' : 'Primary capture'}</Fig>
          </div>
        </div>
      </section>

      {hasTour && (
        <section className="sp-section" aria-labelledby="tour-h">
          <div className="sp-wrap">
            <SectionHead
              label="Workflow"
              title={
                <span id="tour-h">
                  {tourTitles[product.slug]?.[0] ?? 'How it'} <em>{tourTitles[product.slug]?.[1] ?? 'flows.'}</em>
                </span>
              }
            />
            <Tour product={product} />
          </div>
        </section>
      )}

      <section className="sp-section" aria-labelledby="surfaces-h">
        <div className="sp-wrap">
          <SectionHead
            label="Surfaces"
            title={
              <span id="surfaces-h">
                Where it <em>runs.</em>
              </span>
            }
          />
          <Surfaces product={product} />
        </div>
      </section>

      <section className="sp-section" aria-labelledby="record-h">
        <div className="sp-wrap">
          <SectionHead
            label="Record"
            title={
              <span id="record-h">
                Status, <em>stated plainly.</em>
              </span>
            }
          />
          <Record product={product} />
        </div>
      </section>

      <div className="sp-wrap">
        <Link className="sp-next sp-immerse-hover" to={`${BASE}/work/${next.slug}`} data-hue="" style={hueVars(next)}>
          <span className="sp-mono">
            <span style={{ color: 'var(--hue-ink)' }}>Next product</span> <span className="sp-mono-dim">— {next.discipline} · {next.stageLabel}</span>
          </span>
          <span className="sp-name">{next.name}</span>
        </Link>
      </div>
    </article>
  )
}
