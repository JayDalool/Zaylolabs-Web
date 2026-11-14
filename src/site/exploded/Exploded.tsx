/**
 * Exploded specimen — public component.
 *
 * Progressive enhancement: the CSS-3D stack renders immediately (and is the
 * permanent fallback when WebGL is unavailable). The WebGL scene is a separate
 * chunk that only loads once the component scrolls near the viewport.
 */
import { useInView } from 'motion/react'
import { lazy, Suspense, useRef } from 'react'
import type { MotionValue } from 'motion/react'
import type { Product, Surface } from '../../data/products'
import { ProductMedia, WindowFrame } from '../../media/ProductMedia'
import { useIsNarrow, usePrefersReducedMotion, useWebGL } from '../../shared/env'
import { LAYERS, structureSvg, type Pin } from './layers'

const ExplodedScene = lazy(() => import('./ExplodedScene'))

export interface ExplodedProps {
  product: Product
  surface?: Surface
  explode?: number | MotionValue<number>
  flatten?: number | MotionValue<number>
  pins?: Pin[]
  activePin?: number | null
  isolate?: number | null
  showLabels?: boolean
}

function CssStack({ product, surface, pins = [] }: { product: Product; surface: Surface; pins?: Pin[] }) {
  return (
    <div className="sp-exf" aria-hidden="true">
      <div className="sp-exf-stack" data-surface={surface}>
        <div className="sp-exf-layer is-grid" style={{ '--i': 0 } as React.CSSProperties} />
        <div className="sp-exf-layer" style={{ '--i': 1 } as React.CSSProperties} dangerouslySetInnerHTML={{ __html: structureSvg(surface).replace('<svg ', '<svg style="width:100%;height:100%" preserveAspectRatio="none" ') }} />
        <div className="sp-exf-layer" style={{ '--i': 2, border: 0, background: 'none', overflow: 'visible' } as React.CSSProperties}>
          {surface === 'desktop' ? (
            <WindowFrame style={{ boxShadow: 'none', height: '100%' }}>
              <ProductMedia product={product} surface={surface} priority />
            </WindowFrame>
          ) : (
            <ProductMedia product={product} surface={surface} priority style={{ height: '100%', border: '1px solid var(--ink)', borderRadius: 'var(--radius)' }} />
          )}
        </div>
        <div className="sp-exf-layer is-notes" style={{ '--i': 3 } as React.CSSProperties}>
          {pins.map((p, i) => (
            <i key={i} style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function Exploded({ product, surface, explode = 1, flatten = 0, pins, activePin, isolate, showLabels }: ExplodedProps) {
  const s = surface ?? product.primarySurface
  const ref = useRef<HTMLDivElement>(null)
  const webgl = useWebGL()
  const reduce = usePrefersReducedMotion()
  const narrow = useIsNarrow(700)
  const near = useInView(ref, { margin: '300px 0px', once: true })
  const visible = useInView(ref, { margin: '80px 0px' })
  const fallback = <CssStack product={product} surface={s} pins={pins} />

  return (
    <div
      ref={ref}
      className="sp-ex"
      role="img"
      aria-label={`Exploded diagram of ${product.name} in four layers: ${LAYERS.map((l) => l.name.toLowerCase()).join(', ')}.`}
    >
      {webgl && near ? (
        <Suspense fallback={fallback}>
          <ExplodedScene
            product={product}
            surface={s}
            explode={explode}
            flatten={flatten}
            pins={pins}
            activePin={activePin}
            isolate={isolate}
            narrow={narrow}
            still={reduce}
            running={visible}
            showLabels={showLabels}
          />
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  )
}
