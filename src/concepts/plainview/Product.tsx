/**
 * Plain View — product page. One template for every product.
 * Status is at the top, in words; the case shows the screen for the chosen topic.
 */
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { productBySlug, products, type Surface } from '../../data/products'
import { hasRealMedia } from '../../media/manifest'
import { PhoneFrame, ProductMedia, ProductVideo, WindowFrame } from '../../media/ProductMedia'
import { ZoomDialog } from '../../media/ZoomDialog'
import { Case } from './Case'
import { Arrow, hueVars, position, PV, runsOn, StagePill, surfaceWord } from './ui'

export default function ProductPage() {
  const { slug } = useParams()
  const product = productBySlug(slug)
  const [slot, setSlot] = useState(1)
  const [zoom, setZoom] = useState<Surface | null>(null)
  useEffect(() => {
    setSlot(1)
    if (product) document.title = `${product.name} — ZayloLabs (prototype)`
  }, [product])

  if (!product) {
    return (
      <div className="pv-wrap pv-missing">
        <h1>That product isn’t here.</h1>
        <Link className="pv-btn" to={`${PV}#products`}>
          See all products <Arrow />
        </Link>
      </div>
    )
  }

  const i = products.indexOf(product)
  const prev = products[(i - 1 + products.length) % products.length]
  const next = products[(i + 1) % products.length]
  const restricted = product.stage === 'internal'

  return (
    <article className="pv-page" style={hueVars(product)} key={product.slug}>
      <div className="pv-wrap">
        <p className="pv-crumb">
          <Link to={`${PV}#products`}>Products</Link>
          <span aria-hidden="true">/</span>
          <span>{product.name}</span>
        </p>

        <div className="pv-page-top">
          <div>
            <p className="pv-label">
              <span className="pv-label-hue">Product {position(product)}</span>
              {product.discipline}
            </p>
            <h1>
              {product.name}
              {product.alias && <small> / {product.alias}</small>}
            </h1>
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
            {product.caution && <p className="pv-caution">{product.caution}</p>}
          </div>
          <div className="pv-page-covers-h">
            <h2 className="pv-label">What it covers</h2>
            {!restricted && <p className="pv-hint">Choose a topic to see its screen.</p>}
          </div>
          <div className="pv-page-case">
            <Case items={[product]} active={0} slot={slot} eager />
          </div>
          <div className="pv-page-covers">
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
              <>
                <ul className="pv-focus">
                  {product.focus.map((f, k) => (
                    <li key={f.title}>
                      <button type="button" className="pv-focus-item" aria-pressed={slot === k + 1} onClick={() => setSlot(k + 1)}>
                        <i aria-hidden="true" />
                        <span>
                          <b>{f.title}</b>
                          {f.note}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        <section className="pv-page-section" aria-labelledby="pv-screens-h">
          <h2 id="pv-screens-h">Screens</h2>
          <p className="pv-hint">
            {hasRealMedia(product.slug)
              ? 'Real screenshots of the application. Any empty slot is marked as a placeholder.'
              : 'No real screenshot has been added yet. Everything below is a marked placeholder, not the real interface.'}{' '}
            No customer information, credentials or internal operational detail is shown.
          </p>
          <div className="pv-screens" data-count={product.surfaces.length}>
            {product.surfaces.map((s) => (
              <figure key={s} data-surface={s}>
                {s === 'desktop' ? (
                  <WindowFrame title={product.name}>
                    <ProductMedia product={product} surface="desktop" slot={1} />
                    {restricted && (
                      <>
                        <span className="pv-hatch" aria-hidden="true" />
                        <span className="pv-seal">Internal — screens not shown</span>
                      </>
                    )}
                  </WindowFrame>
                ) : (
                  <PhoneFrame>
                    <ProductMedia product={product} surface="mobile" slot={1} />
                  </PhoneFrame>
                )}
                <figcaption>
                  {surfaceWord(s)}
                  {!restricted && (
                    <button type="button" className="pv-link" onClick={() => setZoom(s)}>
                      Enlarge
                    </button>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
          <figure className="pv-video">
            <ProductVideo product={product} label="interface walkthrough" />
            <figcaption>Video</figcaption>
          </figure>
        </section>

        <nav className="pv-pager" aria-label="Other products">
          <Link to={`${PV}/products/${prev.slug}`} style={hueVars(prev)}>
            <span>Previous</span>
            <b>{prev.name}</b>
            <StagePill product={prev} />
          </Link>
          <Link to={`${PV}/products/${next.slug}`} style={hueVars(next)}>
            <span>Next</span>
            <b>{next.name}</b>
            <StagePill product={next} />
          </Link>
        </nav>
      </div>
      {zoom && <ZoomDialog product={product} surface={zoom} slot={1} onClose={() => setZoom(null)} />}
    </article>
  )
}
