/** Living reference for the Specimen design system. Everything shown is the real component. */
import type { ReactNode } from 'react'
import { products } from '../data/products'
import { PhoneFrame, ProductGlyph, ProductMedia, ProductVideo, WindowFrame } from '../media/ProductMedia'
import { BASE, ButtonLink, Fig, FocusList, hueVars, StageBadge, Tag, ZMark } from './ui'

function Block({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="sp-ds-block">
      <div>
        <h2 className="sp-h3">{title}</h2>
        {note && (
          <p className="sp-body" style={{ fontSize: '0.92rem', marginTop: '0.6rem' }}>
            {note}
          </p>
        )}
      </div>
      <div style={{ minWidth: 0, display: 'grid', gap: '1.4rem' }}>{children}</div>
    </section>
  )
}

function Swatch({ name, value, token, border }: { name: string; value: string; token?: string; border?: boolean }) {
  return (
    <div className="sp-swatch">
      <i style={{ background: value, borderBottomColor: border ? undefined : 'transparent' }} />
      <div>
        {name}
        <span>{token ?? value}</span>
      </div>
    </div>
  )
}

const CORE = [
  ['Paper', '#f1ede3', '--paper'],
  ['Paper high', '#f8f5ee', '--paper-hi'],
  ['Paper low', '#e7e1d3', '--paper-lo'],
  ['Ink', '#15140f', '--ink'],
  ['Ink 2', '#48453a', '--ink-2'],
  ['Ink 3', '#6a6557', '--ink-3'],
  ['Signal', '#e8431c', '--signal · graphics'],
  ['Signal ink', '#bd3110', '--signal-ink · text'],
] as const

const TYPE = [
  ['Display', 'sp-display', 'Layer by layer', 'Fraunces 360 · −3.5% · 0.9'],
  ['Heading', 'sp-h2', 'What the lab builds', 'Fraunces 370 · −2.8%'],
  ['Name', 'sp-name', 'SamVisionAI', 'Fraunces italic · SOFT 100 · WONK 1'],
  ['Subhead', 'sp-h3', 'Property analysis that ends in a decision.', 'Fraunces 420'],
  ['Lede', 'sp-lede', 'An independent software development studio.', 'Instrument Sans 400'],
  ['Body', 'sp-body', 'Describe only what the product actually is.', 'Instrument Sans 400 · 17/26'],
  ['Label', 'sp-mono', 'Product 1 of 5', 'IBM Plex Mono 500 · +9% · caps'],
] as const

const ADD_PRODUCT = `// 1 — src/data/products.ts
{
  slug: 'newproduct',
  catalog: 'ZL-006',
  name: 'NewProduct',
  discipline: 'What kind of software it is',
  tagline: 'One honest line.',
  summary: 'What it actually does — nothing more.',
  stage: 'prototype',              // 'in-development' | 'internal' | 'prototype'
  stageLabel: 'Prototype',
  availability: 'Experimental prototype. Not released.',
  focus: [{ title: 'Focus area', note: 'One line.' }],
  surfaces: ['desktop', 'mobile'],
  primarySurface: 'desktop',
  motif: 'parcel',                 // placeholder schematic + glyph
  hue: { name: 'Hue name', ink: '#…', bright: '#…', wash: '#…' },
}

// 2 — drop captures in (optional; placeholders render until you do)
src/assets/products/newproduct/desktop/01-overview.png
src/assets/products/newproduct/mobile/01-home.png
src/assets/products/newproduct/video/01-tour.mp4

// 3 — optional: a step-by-step demo in src/site/demo/demos.tsx
//     (made-up data only; it must not show anything the app cannot do)`

export default function System() {
  const sam = products[0]
  const mfe = products[1]
  return (
    <div className="sp-wrap" style={{ paddingBlock: 'clamp(2rem, 5vw, 4.5rem) clamp(4rem, 8vw, 7rem)' }}>
      <p className="sp-mono sp-signal" style={{ margin: '0 0 1.2rem' }}>
        Design system
      </p>
      <h1 className="sp-display" style={{ fontSize: 'clamp(2.8rem, 8vw, 8rem)' }}>
        The parts <em>on the bench.</em>
      </h1>
      <p className="sp-lede" style={{ margin: 'clamp(1.4rem, 3vw, 2.4rem) 0 clamp(2.5rem, 5vw, 4.5rem)' }}>
        One system for every ZayloLabs page: paper, ink and a single signal colour; a serif for names, a mono for labels; and a media kit that shows real captures or
        says plainly that it has none.
      </p>

      <Block title="Principles" note="The rules the components enforce.">
        <ol className="sp-focus">
          <li>
            <b>Show the software.</b>
            <span>Captures are the hero. Chrome is a hairline, never decoration.</span>
          </li>
          <li>
            <b>Label everything.</b>
            <span>What it is, its stage and its availability travel with every product. Stage uses a shape and a word, never colour alone.</span>
          </li>
          <li>
            <b>Never fake it.</b>
            <span>An empty capture slot renders a stamped schematic, not an invented interface.</span>
          </li>
          <li>
            <b>One accent at a time.</b>
            <span>Signal vermilion belongs to the studio; inside a product scope the accent becomes that product’s hue.</span>
          </li>
        </ol>
      </Block>

      <Block title="Mark" note="The Z is a measured line: two ticks, a diagonal, a signal dot at the end.">
        <div className="sp-ds-row" style={{ gap: '2.5rem' }}>
          <ZMark size={96} />
          <ZMark size={48} />
          <ZMark size={26} />
          <span className="sp-logo">
            <ZMark />
            <span className="sp-logo-word">
              Zaylo<small>Labs</small>
            </span>
          </span>
        </div>
      </Block>

      <Block title="Colour" note="Core tokens. Text colours pass WCAG AA on paper; Signal is for graphics, Signal ink for text.">
        <div className="sp-swatches">
          {CORE.map(([n, v, t]) => (
            <Swatch key={n} name={n} value={v} token={t} border />
          ))}
        </div>
        <p className="sp-mono sp-mono-dim" style={{ margin: 0 }}>
          Product hues — ink for paper, bright for dark scenes, wash for tints
        </p>
        <div className="sp-swatches">
          {products.map((p) => (
            <div key={p.slug} className="sp-swatch">
              <i style={{ background: `linear-gradient(90deg, ${p.hue.ink} 0 34%, ${p.hue.bright} 34% 67%, ${p.hue.wash} 67%)` }} />
              <div>
                {p.hue.name}
                <span>{p.name}</span>
              </div>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Type" note="Fraunces for display and names, Instrument Sans for reading, IBM Plex Mono for labels. All self-hosted, latin subset.">
        <div>
          {TYPE.map(([name, cls, sample, spec]) => (
            <div key={name} className="sp-typerow">
              <span className="sp-mono sp-mono-dim">
                {name}
                <br />
                {spec}
              </span>
              <span className={cls} style={cls === 'sp-display' ? { fontSize: 'clamp(2.6rem, 7vw, 6.5rem)' } : cls === 'sp-name' ? { fontSize: 'clamp(2.2rem, 5vw, 4.4rem)' } : undefined}>
                {sample}
              </span>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Labels & actions" note="Tags, stage badges, buttons, glyphs.">
        <div className="sp-ds-row">
          <Tag>Real-estate intelligence</Tag>
          {products
            .filter((p, i, a) => a.findIndex((q) => q.stage === p.stage) === i)
            .map((p) => (
              <StageBadge key={p.stage} product={p} />
            ))}
        </div>
        <div className="sp-ds-row">
          <ButtonLink to={`${BASE}/work`}>Primary action</ButtonLink>
          <ButtonLink ghost to={`${BASE}/work`}>
            Secondary action
          </ButtonLink>
          <button className="sp-chip" aria-pressed="true">
            Chip on
          </button>
          <button className="sp-chip" aria-pressed="false">
            Chip off
          </button>
        </div>
        <div className="sp-ds-row" style={{ gap: '1.6rem' }}>
          {products.map((p) => (
            <span key={p.slug} className="sp-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: p.hue.ink }}>
              <ProductGlyph motif={p.motif} size={26} /> {p.motif}
            </span>
          ))}
        </div>
      </Block>

      <Block title="Media kit" note="WindowFrame, PhoneFrame, ProductMedia and ProductVideo. Slots fill from src/assets/products/<slug>/ in filename order.">
        <div className="sp-grid" style={{ rowGap: '1.5rem', alignItems: 'end' }} data-hue="">
          <div className="col-span-12 md:col-span-8" data-hue="" style={hueVars(sam)}>
            <WindowFrame title="WindowFrame · ProductMedia desktop">
              <ProductMedia product={sam} surface="desktop" />
            </WindowFrame>
          </div>
          <div className="col-span-6 md:col-span-3" data-hue="" style={hueVars(mfe)}>
            <PhoneFrame>
              <ProductMedia product={mfe} surface="mobile" />
            </PhoneFrame>
          </div>
        </div>
        <div style={{ border: '1px solid var(--ink)', borderRadius: 'var(--radius)', overflow: 'hidden', maxWidth: '36rem' }}>
          <ProductVideo product={sam} />
        </div>
        <Fig n="S1">Empty slots — stamped placeholders, never fictional screenshots</Fig>
      </Block>

      <Block title="Lists" note="A product’s “what it covers” list. The same list drives the screen viewer and the home sections.">
        <div data-hue="" style={{ ...hueVars(sam), maxWidth: '30rem' }}>
          <FocusList product={sam} active={1} />
        </div>
      </Block>

      <Block title="Immersion" note="A section that belongs to one app takes that app’s colours while the visitor is in it: on hover, on keyboard focus, or on touch when it is the section on screen. Product pages are in their app’s colours throughout.">
        <div className="sp-ds-row" style={{ gap: 0, border: '1px solid var(--ink)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          {products.map((p) => (
            <button key={p.slug} type="button" className="sp-immerse-hover" data-hue="" style={{ ...hueVars(p), flex: '1 1 9rem', minHeight: '4.5rem', padding: '0.8rem 1rem', border: 0, textAlign: 'left', font: 'inherit', cursor: 'default' }}>
              <span className="sp-mono" style={{ display: 'block', color: 'var(--ink-3)' }}>
                Point here
              </span>
              <b style={{ fontWeight: 550 }}>{p.name}</b>
            </button>
          ))}
        </div>
        <Fig n="S2">Colours come from each product’s hue; set brandField on a product to use the app’s real colour</Fig>
      </Block>

      <Block title="Motion" note="Measured, never bouncy. Scroll-linked where it explains something; removed entirely under prefers-reduced-motion.">
        <div className="sp-swatches">
          {[
            ['Ease', 'cubic-bezier(.2,.7,.2,1)'],
            ['Fast', '180 ms · hover, press'],
            ['Medium', '420 ms · state change'],
            ['Slow', '900 ms · reveal, page'],
          ].map(([n, v]) => (
            <div key={n} className="sp-swatch">
              <div>
                {n}
                <span>{v}</span>
              </div>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Adding a product" note="A new product needs one catalogue entry and, when they exist, a folder of screenshots. Its home section, page, viewer and colours follow from that.">
        <pre className="sp-code" tabIndex={0}>
          {ADD_PRODUCT}
        </pre>
      </Block>
    </div>
  )
}
