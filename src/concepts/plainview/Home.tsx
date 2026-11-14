/**
 * Plain View — homepage.
 *
 * One ordinary page, top to bottom: what the studio is, a list of every product,
 * then each product in plain words. On wide screens the display case stays
 * beside the text and shows whichever product is being read.
 */
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { products, stages, studio, type Product } from '../../data/products'
import { ProductGlyph } from '../../media/ProductMedia'
import { useMediaQuery, usePrefersReducedMotion } from '../../shared/env'
import { Case } from './Case'
import { Arrow, countWord, hueVars, position, PV, runsOn, StagePill } from './ui'

/** Follows "#products"-style links, including ones arriving from another page. */
function useAnchorScroll() {
  const { hash, key } = useLocation()
  const reduce = usePrefersReducedMotion()
  useEffect(() => {
    const id = decodeURIComponent(hash.slice(1))
    const raf = requestAnimationFrame(() => {
      const el = id ? document.getElementById(id) : null
      if (!el) return
      // Keyboard focus follows the jump, so the next Tab continues from the section, not from the header.
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
      el.focus({ preventScroll: true })
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    })
    return () => cancelAnimationFrame(raf)
  }, [hash, key, reduce])
}

function ProductSection({
  product,
  slot,
  onSlot,
  inlineCase,
  sectionRef,
}: {
  product: Product
  slot: number
  onSlot: (n: number) => void
  inlineCase: boolean
  sectionRef: (el: HTMLElement | null) => void
}) {
  const restricted = product.stage === 'internal'
  return (
    <section id={product.slug} ref={sectionRef} className="pv-product" style={hueVars(product)} aria-labelledby={`pv-h-${product.slug}`}>
      <p className="pv-label">
        <span className="pv-label-hue">Product {position(product)}</span>
        {product.discipline}
      </p>
      <h2 id={`pv-h-${product.slug}`}>
        {product.name}
        {product.alias && <small> / {product.alias}</small>}
      </h2>
      <p className="pv-tagline">{product.tagline}</p>
      <p className="pv-summary">{product.summary}</p>

      <dl className="pv-facts">
        <div>
          <dt>Stage</dt>
          <dd>
            <StagePill product={product} />
          </dd>
        </div>
        <div>
          <dt>Availability</dt>
          <dd>{product.availability}</dd>
        </div>
        <div>
          <dt>Made for</dt>
          <dd>{runsOn(product)}</dd>
        </div>
      </dl>

      <h3 className="pv-label">What it covers</h3>
      {!restricted && <p className="pv-hint">Choose a topic to see its screen.</p>}
      {/* Narrow screens: the picture sits directly above the topics that change it, and stays with them. */}
      <div className="pv-pinzone">
        {inlineCase && (
          <div className="pv-inline-case">
            <Case items={[product]} active={0} slot={slot} />
          </div>
        )}
        {restricted ? (
          <ul className="pv-focus">
            {product.focus.map((f) => (
              <li key={f.title}>
                <div className="pv-focus-item">
                  <i aria-hidden="true" />
                  <span>
                    <b>{f.title}</b>
                    {f.note}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="pv-focus">
            {product.focus.map((f, k) => (
              <li key={f.title}>
                <button type="button" className="pv-focus-item" aria-pressed={slot === k + 1} onClick={() => onSlot(k + 1)}>
                  <i aria-hidden="true" />
                  <span>
                    <b>{f.title}</b>
                    {f.note}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {product.caution && <p className="pv-caution">{product.caution}</p>}

      <Link className="pv-btn" to={`${PV}/products/${product.slug}`}>
        Open {product.name} <Arrow />
      </Link>
    </section>
  )
}

export default function Home() {
  const wide = useMediaQuery('(min-width: 960px)')
  const [active, setActive] = useState(0)
  const [peek, setPeek] = useState<number | null>(null)
  const [slots, setSlots] = useState<Record<string, number>>({})
  const sections = useRef<(HTMLElement | null)[]>([])
  useAnchorScroll()

  useEffect(() => {
    document.title = 'ZayloLabs — design prototype'
  }, [])

  // The case follows the product section that is crossing the middle of the screen.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i))
      },
      { rootMargin: '-42% 0px -52% 0px' },
    )
    sections.current.forEach((el, i) => {
      if (!el) return
      el.dataset.i = String(i)
      io.observe(el)
    })
    // A preview started from the list ends as soon as the page moves.
    const clear = () => setPeek(null)
    window.addEventListener('scroll', clear, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', clear)
    }
  }, [])

  const shown = peek ?? active
  const current = products[shown]

  return (
    <>
      <div className="pv-wrap pv-split" data-wide={wide || undefined}>
        <div className="pv-col">
          <section className="pv-hero" aria-labelledby="pv-h1">
            <p className="pv-label">{studio.line.replace(/\.$/, '')}</p>
            <h1 id="pv-h1">
              One studio.
              <br />
              {countWord(products.length)} products.
            </h1>
            <p className="pv-lede">
              {studio.about} <span>Each one is shown at the stage it is really at.</span>
            </p>
          </section>

          <nav className="pv-index" id="products" aria-labelledby="pv-index-h">
            <h2 className="pv-label" id="pv-index-h">
              Products
            </h2>
            <ol onMouseLeave={() => setPeek(null)}>
              {products.map((p, i) => (
                <li key={p.slug} style={hueVars(p)}>
                  <Link
                    className="pv-row"
                    to={`${PV}/products/${p.slug}`}
                    data-active={(wide && i === shown) || undefined}
                    onMouseEnter={() => setPeek(i)}
                    onFocus={(e) => e.currentTarget.matches(':focus-visible') && setPeek(i)}
                    onBlur={() => setPeek(null)}
                    onClick={() => setPeek(null)}
                  >
                    <span className="pv-row-glyph">
                      <ProductGlyph motif={p.motif} size={24} />
                    </span>
                    <span className="pv-row-text">
                      <b>{p.name}</b>
                      <span>{p.discipline}</span>
                    </span>
                    <StagePill product={p} />
                  </Link>
                </li>
              ))}
            </ol>
          </nav>

          {products.map((p, i) => (
            <ProductSection
              key={p.slug}
              product={p}
              slot={slots[p.slug] ?? 1}
              onSlot={(n) => setSlots((s) => ({ ...s, [p.slug]: n }))}
              inlineCase={!wide}
              sectionRef={(el) => void (sections.current[i] = el)}
            />
          ))}
        </div>

        {wide && (
          <aside className="pv-stick" aria-label={`Screens — ${current.name}`}>
            <Case items={products} active={shown} slot={slots[current.slug] ?? 1} eager />
          </aside>
        )}
      </div>

      <section id="studio" className="pv-studio" aria-labelledby="pv-studio-h">
        <div className="pv-wrap pv-studio-grid">
          <div>
            <p className="pv-label">The studio</p>
            <h2 id="pv-studio-h">{studio.line}</h2>
            <p className="pv-studio-about">{studio.about}</p>
          </div>
          <div>
            <h3 className="pv-label">What ZayloLabs builds</h3>
            <ul className="pv-plain">
              {studio.practice.map((p) => (
                <li key={p.title}>
                  <b>{p.title}</b>
                  <span>{p.note}</span>
                </li>
              ))}
            </ul>
            <h3 className="pv-label">What the stage labels mean</h3>
            <ul className="pv-plain">
              {stages.map((s) => {
                const sample = products.find((p) => p.stage === s.id)
                return (
                  <li key={s.id} style={sample ? hueVars(sample) : undefined}>
                    <b>{sample ? <StagePill product={sample} /> : s.label}</b>
                    <span>
                      {s.blurb}{' '}
                      <em>
                        {products
                          .filter((p) => p.stage === s.id)
                          .map((p) => p.name)
                          .join(', ')}
                      </em>
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </section>

      <section id="contact" className="pv-contact" aria-labelledby="pv-contact-h">
        <div className="pv-wrap">
          <h2 className="pv-label" id="pv-contact-h">
            Contact
          </h2>
          {studio.contactEmail ? (
            <a className="pv-contact-big" href={`mailto:${studio.contactEmail}`}>
              {studio.contactEmail}
            </a>
          ) : (
            <>
              <p className="pv-contact-big">{studio.domain}</p>
              <p className="pv-contact-note">A contact address will be added here before launch.</p>
            </>
          )}
        </div>
      </section>
    </>
  )
}
