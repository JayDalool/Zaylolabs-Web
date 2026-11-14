/**
 * Work index — the flight as a list. Every product is one row on the axis;
 * pointing at (or tabbing to) a row brings its window to the front of the
 * depth stack. Rows are ordinary links, so it works with any input.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { products, stages, type Stage } from '../../data/products'
import { ProductGlyph } from '../../media/ProductMedia'
import { useFitNames } from './Copy'
import { Badge, depthOf, DepthStack, Frame, hueStyle, PageShell, two, ZX } from './kit'
import './pages.css'

export default function Gallery() {
  const [stage, setStage] = useState<Stage | 'all'>('all')
  const [active, setActive] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const list = useMemo(() => products.filter((p) => stage === 'all' || p.stage === stage), [stage])
  const current = list[Math.min(active, list.length - 1)]

  useEffect(() => setActive(0), [stage])
  useEffect(() => {
    document.title = 'Work — ZayloLabs (prototype)'
  }, [])
  useFitNames(root)

  return (
    <PageShell readout="Z  INDEX" hue={current?.hue.bright}>
      <div ref={root}>
        <section className="zx-g-hero" aria-labelledby="zx-g-h">
          <p className="zx-p-key">Work — {two(products.length)} stations on one axis</p>
          <h1 id="zx-g-h" className="zx-p-name" data-fit={0.5} data-max={0.34}>
            <span className="zx-fit">Work</span>
          </h1>
          <div className="zx-g-controls">
            <div className="zx-chips" role="group" aria-label="Filter by stage">
              <button type="button" className="zx-chip" aria-pressed={stage === 'all'} onClick={() => setStage('all')}>
                All <sup>{products.length}</sup>
              </button>
              {stages.map((s) => (
                <button type="button" key={s.id} className="zx-chip" aria-pressed={stage === s.id} onClick={() => setStage(s.id)} title={s.blurb}>
                  {s.label} <sup>{products.filter((p) => p.stage === s.id).length}</sup>
                </button>
              ))}
            </div>
            <p className="zx-g-count" aria-live="polite">
              {stage === 'all' ? 'Every product, at its actual stage' : stages.find((s) => s.id === stage)?.blurb}
            </p>
          </div>
        </section>

        <div className="zx-g">
          <ol className="zx-g-list" style={{ '--fill': `${((Math.min(active, list.length - 1) + 0.5) / Math.max(1, list.length)) * 100}%` } as CSSProperties}>
            {list.map((p, i) => (
              <li key={p.slug} style={hueStyle(p)}>
                <Link
                  to={`${ZX}/work/${p.slug}`}
                  viewTransition
                  className={`zx-g-row ${i === active ? 'is-active' : ''}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                >
                  <span className="zx-g-coord">
                    <b>{depthOf(p)}</b>
                    <span>{p.catalog}</span>
                    <span>{p.discipline}</span>
                  </span>
                  <span className="zx-g-name">{p.name}</span>
                  <span className="zx-g-meta">
                    <Badge product={p} />
                    <span className="zx-g-arrow" aria-hidden="true">
                      →
                    </span>
                  </span>
                  <span className="zx-g-tag">{p.tagline}</span>
                  <span className="zx-g-thumb" data-surface={p.primarySurface}>
                    <Frame product={p} restricted={p.stage === 'internal'} />
                  </span>
                </Link>
              </li>
            ))}
            {list.length === 0 && <li className="zx-g-empty">Nothing at this stage.</li>}
          </ol>

          {current && (
            <aside className="zx-g-preview" aria-label="Preview" style={hueStyle(current)}>
              <DepthStack items={list} active={Math.min(active, list.length - 1)} getKey={(p) => p.slug}>
                {(p) => (
                  <div className={p.primarySurface === 'mobile' ? 'zx-ds-phone' : undefined} style={hueStyle(p)}>
                    <Frame product={p} restricted={p.stage === 'internal'} />
                  </div>
                )}
              </DepthStack>
              <div className="zx-g-info" aria-live="polite">
                <p className="zx-meta">
                  <span className="zx-meta-glyph">
                    <ProductGlyph motif={current.motif} size={18} />
                  </span>
                  <span>{current.catalog}</span>
                  <span className="zx-dim">{current.surfaces.join(' + ')}</span>
                </p>
                <p className="zx-tagline">{current.tagline}</p>
                <p className="zx-summary">{current.summary}</p>
                <Link className="zx-open" to={`${ZX}/work/${current.slug}`} viewTransition>
                  Open {current.name} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </aside>
          )}
        </div>
      </div>
    </PageShell>
  )
}
