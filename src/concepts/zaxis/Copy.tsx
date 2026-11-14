import { useEffect, type RefObject } from 'react'
import { Link } from 'react-router-dom'
import { products, studio, type Product } from '../../data/products'
import { ProductGlyph } from '../../media/ProductMedia'
import { BASE } from './stations'

const two = (n: number) => String(n).padStart(2, '0')

/** The Z monogram: three strokes on the depth axis, with the head node at its end. */
export function BrandMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 5.5h16L4 18.5h16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" />
      <circle cx="20" cy="18.5" r="2.4" fill="var(--zx-volt)" />
    </svg>
  )
}

/**
 * Product name for display type. Long camel-cased names are split at their most
 * balanced seam into two lines; on wide screens the lines sit inline (one row),
 * on phones they stack. The inner .zx-fit box is what `useFitNames` measures.
 */
export function FitName({ name, alias }: { name: string; alias?: string }) {
  const parts = name.match(/[A-Z]+(?![a-z])|[A-Z][a-z]+|[a-z]+|\d+/g) ?? [name]
  let lines = [name]
  if (name.length > 11 && parts.length > 1) {
    let best = 1
    let bestMax = Infinity
    for (let i = 1; i < parts.length; i++) {
      const m = Math.max(parts.slice(0, i).join('').length, parts.slice(i).join('').length)
      if (m < bestMax) {
        bestMax = m
        best = i
      }
    }
    lines = [parts.slice(0, best).join(''), parts.slice(best).join('')]
  }
  return (
    <span className="zx-fit" data-lines={lines.length}>
      {alias && <span className="zx-alias">/ {alias}</span>}
      {lines.map((line, i) => (
        <span className="zx-line" key={i}>
          {line}
        </span>
      ))}
    </span>
  )
}

/**
 * Sizes every [data-fit] heading inside `root` so its .zx-fit box spans the given
 * fraction of the viewport width (capped by data-max, a fraction of its height).
 */
export function fitNames(root: HTMLElement | null) {
  if (!root) return
  const vw = document.documentElement.clientWidth
  const vh = window.innerHeight
  root.querySelectorAll<HTMLElement>('[data-fit]').forEach((el) => {
    const box = el.querySelector<HTMLElement>('.zx-fit')
    if (!box) return
    el.style.fontSize = '100px'
    const w = box.offsetWidth
    if (!w) return
    const px = (100 * vw * Number(el.dataset.fit)) / w
    const max = el.dataset.max ? vh * Number(el.dataset.max) : Infinity
    el.style.fontSize = `${Math.min(px, max).toFixed(1)}px`
  })
}

/** Runs `fitNames` on mount, on resize and once web fonts have loaded. */
export function useFitNames(root: RefObject<HTMLElement | null>, layoutKey?: unknown) {
  useEffect(() => {
    const run = () => fitNames(root.current)
    run()
    document.fonts?.ready.then(run)
    document.fonts?.addEventListener?.('loadingdone', run)
    window.addEventListener('resize', run)
    return () => {
      window.removeEventListener('resize', run)
      document.fonts?.removeEventListener?.('loadingdone', run)
    }
  }, [root, layoutKey])
}

export function ProductCopy({ product, index, placeholder }: { product: Product; index: number; placeholder: boolean }) {
  return (
    <>
      <p className="zx-meta">
        <span className="zx-meta-glyph">
          <ProductGlyph motif={product.motif} size={18} />
        </span>
        <span>{product.catalog}</span>
        <span className="zx-dim">
          Station {two(index)} / {two(products.length)}
        </span>
        <span className="zx-badge">{product.stageLabel}</span>
      </p>
      <p className="zx-tagline">{product.tagline}</p>
      <p className="zx-summary">{product.summary}</p>
      <ul className="zx-focus" aria-label={`${product.name} focus areas`}>
        {product.focus.map((f) => (
          <li key={f.title}>{f.title}</li>
        ))}
      </ul>
      <p className="zx-avail">
        <span className="zx-avail-key">Availability</span>
        {product.availability}
      </p>
      {product.caution && <p className="zx-caution">{product.caution}</p>}
      {placeholder && <p className="zx-ph-note">Placeholder schematic shown — real capture pending.</p>}
      <Link className="zx-open" to={`${BASE}/work/${product.slug}`} viewTransition>
        Open {product.name} <span aria-hidden="true">→</span>
      </Link>
    </>
  )
}

export function IntroCopy() {
  return (
    <>
      <p className="zx-intro-about">{studio.about}</p>
      <p className="zx-intro-line">
        {products.length} projects along one axis. <span className="zx-dim">Each shown at its actual stage.</span>
      </p>
    </>
  )
}

export function EndCopy({ onReturn }: { onReturn?: () => void }) {
  return (
    <>
      <p className="zx-meta">
        <span>{studio.domain}</span>
        <span className="zx-dim">{studio.line}</span>
      </p>
      <div className="zx-contact" id="zx-contact">
        <div>
          <h3 className="zx-contact-h">Contact</h3>
          {studio.contactEmail ? (
            <a className="zx-contact-big" href={`mailto:${studio.contactEmail}`}>
              {studio.contactEmail}
            </a>
          ) : (
            <>
              <p className="zx-contact-big">{studio.domain}</p>
              <p className="zx-contact-note">Contact channel wired in at launch.</p>
            </>
          )}
        </div>
        {onReturn && (
          <button type="button" className="zx-btn" onClick={onReturn}>
            Back to the start <span aria-hidden="true">↑</span>
          </button>
        )}
      </div>
      <ul className="zx-practice">
        {studio.practice.map((p, i) => (
          <li key={p.title}>
            <span className="zx-practice-n">{two(i + 1)}</span>
            <strong>{p.title}</strong>
            <span>{p.note}</span>
          </li>
        ))}
      </ul>
    </>
  )
}
