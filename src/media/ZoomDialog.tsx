import { useEffect, useRef, useState } from 'react'
import type { Product, Surface } from '../data/products'
import { ProductMedia } from './ProductMedia'

/**
 * Full-screen zoomable view of one capture slot. Native <dialog>, so focus is
 * trapped and Esc closes it. Zoom with the buttons, + / − / 0, the wheel or a
 * double-click; drag to pan once zoomed in.
 *
 * Themed through --zoom-bg, --zoom-ink, --zoom-rule, --zoom-accent and --sch-font.
 */
export function ZoomDialog({ product, surface, slot = 1, label, onClose }: { product: Product; surface: Surface; slot?: number; label?: string; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const [t, setT] = useState({ x: 0, y: 0, z: 1 })
  const drag = useRef<{ x: number; y: number } | null>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (!d.open) d.showModal()
    // The wheel zooms here; without this the page behind the dialog scrolls as well.
    const hold = (e: WheelEvent) => e.preventDefault()
    d.addEventListener('wheel', hold, { passive: false })
    return () => d.removeEventListener('wheel', hold)
  }, [])
  const reset = () => setT({ x: 0, y: 0, z: 1 })
  const zoom = (dz: number) =>
    setT((v) => {
      const z = Math.min(4, Math.max(1, +(v.z + dz).toFixed(2)))
      return z === 1 ? { x: 0, y: 0, z } : { ...v, z }
    })

  return (
    <dialog
      ref={ref}
      className="zm-zoom"
      aria-label={`${product.name} — ${label ?? 'capture'}, zoomable`}
      onClose={onClose}
      onKeyDown={(e) => {
        if (e.key === '+' || e.key === '=') zoom(0.5)
        if (e.key === '-') zoom(-0.5)
        if (e.key === '0') reset()
      }}
    >
      <div className="zm-zoom-bar">
        <span className="zm-zoom-title">
          <b>{product.catalog}</b> {product.name} <span>— {label ?? surface}</span>
        </span>
        <span className="zm-zoom-controls">
          <button onClick={() => zoom(-0.5)} aria-label="Zoom out">
            −
          </button>
          <button onClick={reset} aria-label="Reset zoom">
            {Math.round(t.z * 100)}%
          </button>
          <button onClick={() => zoom(0.5)} aria-label="Zoom in">
            +
          </button>
          <button className="zm-zoom-close" onClick={() => ref.current?.close()} autoFocus>
            Close
          </button>
        </span>
      </div>
      <div
        className="zm-zoom-view"
        onWheel={(e) => zoom(e.deltaY < 0 ? 0.25 : -0.25)}
        onPointerDown={(e) => {
          drag.current = { x: e.clientX - t.x, y: e.clientY - t.y }
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          const d = drag.current
          if (d && t.z > 1) setT((v) => ({ ...v, x: e.clientX - d.x, y: e.clientY - d.y }))
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
        onDoubleClick={() => (t.z > 1 ? reset() : zoom(1))}
      >
        <div data-surface={surface} style={{ transform: `translate(${t.x}px, ${t.y}px) scale(${t.z})` }}>
          <ProductMedia product={product} surface={surface} slot={slot} label={label} priority />
        </div>
      </div>
    </dialog>
  )
}
