import { useEffect, useRef, type CSSProperties } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { studio, type Product } from '../../data/products'
import { PhoneFrame, ProductMedia, WindowFrame } from '../../media/ProductMedia'
import { BrandMark, EndCopy, FitName, IntroCopy, ProductCopy, useFitNames } from './Copy'
import { SiteNav } from './kit'
import { BASE, depthLabel, stations } from './stations'

const two = (n: number) => String(n).padStart(2, '0')

/** Each product keeps its own arrangement here too — built from the shared media primitives. */
export function Stage({ product }: { product: Product }) {
  const title = `${product.name} — ${product.stageLabel}`
  switch (product.slug) {
    case 'samvisionai':
      return (
        <div className="zx-s-stage zx-s-sam">
          <WindowFrame className="zx-s-back" title={`${product.name} · comparables`}>
            <ProductMedia product={product} surface="desktop" slot={2} label="Comparables" />
          </WindowFrame>
          <WindowFrame className="zx-s-main" title={title}>
            <ProductMedia product={product} surface="desktop" slot={1} priority />
          </WindowFrame>
          <PhoneFrame className="zx-s-phone">
            <ProductMedia product={product} surface="mobile" slot={1} />
          </PhoneFrame>
        </div>
      )
    case 'myfamilyexpenses':
      return (
        <div className="zx-s-stage zx-s-mfe">
          <WindowFrame className="zx-s-back" title={title}>
            <ProductMedia product={product} surface="desktop" slot={1} />
          </WindowFrame>
          <PhoneFrame className="zx-s-phone zx-s-phone-a">
            <ProductMedia product={product} surface="mobile" slot={1} />
          </PhoneFrame>
          <PhoneFrame className="zx-s-phone zx-s-phone-b">
            <ProductMedia product={product} surface="mobile" slot={2} />
          </PhoneFrame>
        </div>
      )
    case 'gyst':
      return (
        <div className="zx-s-stage zx-s-gyst">
          {[3, 2, 1].map((slot) => (
            <WindowFrame key={slot} className={`zx-s-casc zx-s-casc-${slot}`} title={`${product.name} · ${two(slot)}`}>
              <ProductMedia product={product} surface="desktop" slot={slot} />
            </WindowFrame>
          ))}
        </div>
      )
    case 'commandcenter':
      return (
        <div className="zx-s-stage zx-s-cc">
          <WindowFrame className="zx-s-main zx-s-restricted" title={`${product.name} · internal`}>
            <ProductMedia product={product} surface="desktop" slot={1} />
            <span className="zx-s-hatch" aria-hidden="true" />
            <span className="zx-s-seal">Internal — detail withheld</span>
          </WindowFrame>
        </div>
      )
    case 'gauzemate':
      return (
        <div className="zx-s-stage zx-s-gauze">
          <span className="zx-s-ring" aria-hidden="true" />
          <PhoneFrame className="zx-s-phone">
            <ProductMedia product={product} surface="mobile" slot={1} />
          </PhoneFrame>
        </div>
      )
    default:
      return (
        <div className="zx-s-stage">
          {product.primarySurface === 'desktop' ? (
            <WindowFrame className="zx-s-main" title={title}>
              <ProductMedia product={product} surface="desktop" />
            </WindowFrame>
          ) : (
            <PhoneFrame className="zx-s-phone">
              <ProductMedia product={product} surface="mobile" />
            </PhoneFrame>
          )}
        </div>
      )
  }
}

/**
 * Still version of the flight: used when WebGL is unavailable or the visitor
 * prefers reduced motion. Same content, same order, ordinary document scroll.
 */
export function StaticView({ reason }: { reason: 'webgl' | 'motion' }) {
  const jump = (id: string) => () => document.getElementById(id)?.scrollIntoView({ block: 'start' })
  const root = useRef<HTMLDivElement>(null)
  useFitNames(root)
  const { hash } = useLocation()
  useEffect(() => {
    if (hash === '#contact') document.getElementById('zx-s-studio')?.scrollIntoView({ block: 'start' })
  }, [hash])
  return (
    <div className="zx zx-static" ref={root}>
      <header className="zx-s-top">
        <span className="zx-brand">
          <BrandMark />
          <span>
            Zaylo<b>Labs</b>
          </span>
        </span>
        <SiteNav onContact={jump('zx-s-studio')} />
      </header>

      <main>
        <p className="zx-s-mode" style={{ padding: '0 clamp(1rem, 4vw, 3rem)', textAlign: 'left' }}>
          {reason === 'webgl' ? 'Still view — WebGL unavailable' : 'Still view — reduced motion'}
        </p>
        <section className="zx-s-hero" aria-labelledby="zx-h-origin">
          <p className="zx-eyebrow">
            <span>{studio.line}</span>
            <span className="zx-dim">{studio.domain}</span>
          </p>
          <h1 id="zx-h-origin" className="zx-s-wordmark" data-fit={0.9} data-max={0.3}>
            <span className="zx-fit">
              Zaylo<em>Labs</em>
            </span>
          </h1>
          <div className="zx-s-hero-copy">
            <IntroCopy />
            <p style={{ marginTop: '1.4rem' }}>
              <Link className="zx-open" to={`${BASE}/work`} viewTransition>
                View all work <span aria-hidden="true">→</span>
              </Link>
            </p>
          </div>
          <nav aria-label="Stations">
            <ol className="zx-s-index">
              {stations
                .filter((s) => s.kind !== 'intro')
                .map((s, i) => (
                  <li key={s.id} style={{ '--hue': s.hue } as CSSProperties}>
                    <button type="button" onClick={jump(`zx-s-${s.id}`)}>
                      <span className="zx-dim">{depthLabel(i + 1)}</span>
                      <span className="zx-s-index-name">{s.label}</span>
                      <span className="zx-s-index-stage">{s.product?.stageLabel ?? 'End of line'}</span>
                    </button>
                  </li>
                ))}
            </ol>
          </nav>
        </section>

        {stations.map((s, i) =>
          s.product ? (
            <section
              key={s.id}
              id={`zx-s-${s.id}`}
              className="zx-s-station"
              data-side={s.side}
              aria-labelledby={`zx-h-${s.id}`}
              style={{ '--hue': s.hue } as CSSProperties}
            >
              <p className="zx-s-depth" aria-hidden="true">
                {depthLabel(i)}
              </p>
              <h2 className="zx-s-name" id={`zx-h-${s.id}`} data-fit={0.9} data-max={0.26}>
                <FitName name={s.product.name} alias={s.product.alias} />
              </h2>
              <div className="zx-s-body">
                <Stage product={s.product} />
                <div className="zx-s-copy">
                  <ProductCopy product={s.product} index={i} placeholder={s.placeholder} />
                </div>
              </div>
            </section>
          ) : null,
        )}

        <section id="zx-s-studio" className="zx-s-station zx-s-end" aria-labelledby="zx-h-studio">
          <p className="zx-s-depth" aria-hidden="true">
            {depthLabel(stations.length - 1)}
          </p>
          <h2 className="zx-s-name" id="zx-h-studio" data-fit={0.9} data-max={0.26}>
            <span className="zx-fit">Studio</span>
          </h2>
          <div className="zx-s-endcopy">
            <EndCopy onReturn={() => window.scrollTo({ top: 0 })} />
          </div>
        </section>
      </main>
    </div>
  )
}
