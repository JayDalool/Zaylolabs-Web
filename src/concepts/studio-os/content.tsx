import { createContext, useContext, useId, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { products, stages, studio, type Product } from '../../data/products'
import { hasRealMedia } from '../../media/manifest'
import { PhoneFrame, ProductGlyph, ProductMedia } from '../../media/ProductMedia'
import type { AppDef } from './apps'

/** What window contents may ask the shell to do. */
export interface OsApi {
  open: (id: string) => void
  openPalette: () => void
  /** "⌘" on Apple platforms, "Ctrl" elsewhere. */
  mod: string
  shell: 'desktop' | 'mobile'
}
export const OsContext = createContext<OsApi>({ open: () => {}, openPalette: () => {}, mod: 'Ctrl', shell: 'desktop' })
export const useOs = () => useContext(OsContext)

export function StageChip({ p }: { p: Product }) {
  return <span className={`sos-chip sos-chip-${p.stage}`}>{p.stageLabel}</span>
}

/** Catalogue no., stage and availability — present in every product window. */
function Meta({ p, className = '' }: { p: Product; className?: string }) {
  return (
    <dl className={`sos-meta ${className}`}>
      <div>
        <dt>Catalogue</dt>
        <dd>{p.catalog}</dd>
      </div>
      <div>
        <dt>Stage</dt>
        <dd>
          <StageChip p={p} />
        </dd>
      </div>
      <div className="sos-meta-wide">
        <dt>Availability</dt>
        <dd>{p.availability}</dd>
      </div>
    </dl>
  )
}

const hueVars = (p: Product) => ({ '--hue': p.hue.ink, '--hue-wash': p.hue.wash, '--sch-accent': p.hue.ink }) as CSSProperties

/* —— SamVisionAI: wide workspace with a focus-area sidebar —— */
function SamVision({ p }: { p: Product }) {
  const [i, setI] = useState(0)
  const [surface, setSurface] = useState<'desktop' | 'mobile'>('desktop')
  const f = p.focus[i]
  return (
    <div className="sos-sam" style={hueVars(p)}>
      <aside className="sos-sam-side">
        <p className="sos-kicker">{p.discipline}</p>
        <h2 className="sos-h2">{p.name}</h2>
        <p className="sos-tagline">{p.tagline}</p>
        <ol className="sos-focus" aria-label="Focus areas">
          {p.focus.map((x, k) => (
            <li key={x.title}>
              <button type="button" className={k === i ? 'is-on' : ''} aria-pressed={k === i} onClick={() => setI(k)}>
                <span className="sos-focus-n">{String(k + 1).padStart(2, '0')}</span>
                <span className="sos-focus-t">{x.title}</span>
                {k === i && <span className="sos-focus-note">{x.note}</span>}
              </button>
            </li>
          ))}
        </ol>
        <Meta p={p} />
      </aside>
      <div className="sos-sam-view">
        <div className="sos-viewbar">
          <span>
            {surface}-{String(i + 1).padStart(2, '0')} · {f.title}
          </span>
          <span className="sos-seg" role="group" aria-label="Surface">
            {(['desktop', 'mobile'] as const).map((s) => (
              <button key={s} type="button" aria-pressed={surface === s} className={surface === s ? 'is-on' : ''} onClick={() => setSurface(s)}>
                {s}
              </button>
            ))}
          </span>
        </div>
        <div className={`sos-fit sos-fit-${surface}`}>
          {surface === 'desktop' ? (
            <ProductMedia key={`d${i}`} product={p} surface="desktop" slot={i + 1} label={f.title} priority />
          ) : (
            <PhoneFrame>
              <ProductMedia key={`m${i}`} product={p} surface="mobile" slot={i + 1} label={f.title} />
            </PhoneFrame>
          )}
        </div>
      </div>
    </div>
  )
}

/* —— MyFamilyExpenses: a phone beside a receipt —— */
function FamilyExpenses({ p }: { p: Product }) {
  return (
    <div className="sos-mfe" style={hueVars(p)}>
      <div className="sos-mfe-phone">
        <PhoneFrame>
          <ProductMedia product={p} surface="mobile" label="Household" />
        </PhoneFrame>
      </div>
      <div className="sos-receipt">
        <div className="sos-receipt-paper">
          <p className="sos-receipt-head">
            <span>ZAYLOLABS</span>
            <span>{p.catalog}</span>
          </p>
          <h2 className="sos-h2">{p.name}</h2>
          <p className="sos-receipt-sub">{p.discipline}</p>
          <hr />
          <ol>
            {p.focus.map((x, k) => (
              <li key={x.title}>
                <span className="sos-receipt-row">
                  <b>{x.title}</b>
                  <i>{String(k + 1).padStart(2, '0')}</i>
                </span>
                <span className="sos-receipt-note">{x.note}</span>
              </li>
            ))}
          </ol>
          <hr />
          <p className="sos-receipt-row">
            <span>Stage</span>
            <StageChip p={p} />
          </p>
          <p className="sos-receipt-row">
            <span>Access</span>
            <span className="sos-receipt-val">{p.availability}</span>
          </p>
          <hr />
          <p className="sos-receipt-foot">{p.tagline}</p>
        </div>
      </div>
    </div>
  )
}

/* —— GYST: tabs, one per focus area —— */
function Gyst({ p }: { p: Product }) {
  const [i, setI] = useState(0)
  const base = useId()
  const onKey = (e: KeyboardEvent) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!d) return
    e.preventDefault()
    const n = (i + d + p.focus.length) % p.focus.length
    setI(n)
    document.getElementById(`${base}-t${n}`)?.focus()
  }
  const f = p.focus[i]
  return (
    <div className="sos-gyst" style={hueVars(p)}>
      <header className="sos-gyst-head">
        <div>
          <p className="sos-kicker">{p.discipline}</p>
          <h2 className="sos-h2">
            {p.name}
            {p.alias && <span className="sos-alias">/ {p.alias}</span>}
          </h2>
        </div>
        <p className="sos-tagline">{p.tagline}</p>
      </header>
      <div className="sos-tabs" role="tablist" aria-label={`${p.name} focus areas`} onKeyDown={onKey}>
        {p.focus.map((x, k) => (
          <button key={x.title} type="button" role="tab" id={`${base}-t${k}`} aria-selected={k === i} aria-controls={`${base}-p`} tabIndex={k === i ? 0 : -1} className={k === i ? 'is-on' : ''} onClick={() => setI(k)}>
            {x.title}
          </button>
        ))}
      </div>
      <div className="sos-tabpanel" role="tabpanel" id={`${base}-p`} aria-labelledby={`${base}-t${i}`}>
        <p className="sos-tabnote">
          <span>{String(i + 1).padStart(2, '0')}</span>
          {f.note}
        </p>
        <div className="sos-fit sos-fit-desktop sos-fit-ruled">
          <ProductMedia key={i} product={p} surface="desktop" slot={i + 1} label={f.title} />
        </div>
      </div>
      <Meta p={p} className="sos-meta-row" />
    </div>
  )
}

/* —— CommandCenter: a terminal that states plainly what it will not show —— */
function CommandCenter({ p }: { p: Product }) {
  return (
    <div className="sos-term">
      <p>
        <span className="sos-term-prompt">studio ~ %</span> describe {p.slug}
      </p>
      <dl className="sos-term-kv">
        <div>
          <dt>catalogue</dt>
          <dd>{p.catalog}</dd>
        </div>
        <div>
          <dt>name</dt>
          <dd className="sos-term-hi">{p.name}</dd>
        </div>
        <div>
          <dt>class</dt>
          <dd>{p.discipline}</dd>
        </div>
        <div>
          <dt>stage</dt>
          <dd>
            <span className="sos-term-tag">{p.stageLabel}</span>
          </dd>
        </div>
        <div>
          <dt>availability</dt>
          <dd>{p.availability}</dd>
        </div>
      </dl>
      <p className="sos-term-section">scope</p>
      <ul className="sos-term-scope">
        {p.focus.map((x) => (
          <li key={x.title}>
            <span className="sos-term-hi">{x.title}</span>
            <span>{x.note}</span>
          </li>
        ))}
      </ul>
      <p className="sos-term-section">interface</p>
      <p className="sos-term-redact">
        <span aria-hidden="true">▒▒▒▒▒▒▒▒▒▒▒▒</span> internal — interface not shown publicly.
        {p.caution && <> {p.caution}</>}
      </p>
      <p>
        <span className="sos-term-prompt">studio ~ %</span> <span className="sos-term-caret" aria-hidden="true" />
      </p>
    </div>
  )
}

/* —— GauzeMate: a small utility widget, clearly a prototype —— */
function GauzeMate({ p }: { p: Product }) {
  return (
    <div className="sos-gauze" style={hueVars(p)}>
      <div className="sos-gauze-top">
        <div>
          <span className="sos-gauze-dial">
            <ProductGlyph motif={p.motif} size={34} />
          </span>
          <h2 className="sos-h2">{p.name}</h2>
          <p className="sos-kicker">
            {p.catalog} · {p.discipline}
          </p>
        </div>
        <div className="sos-gauze-phone">
          <PhoneFrame>
            <ProductMedia product={p} surface="mobile" label="Reminder" />
          </PhoneFrame>
        </div>
      </div>
      <ul className="sos-gauze-list">
        {p.focus.map((x) => (
          <li key={x.title}>
            <b>{x.title}</b>
            <span>{x.note}</span>
          </li>
        ))}
      </ul>
      {p.caution && (
        <p className="sos-caution" role="note">
          <StageChip p={p} />
          {p.caution}
        </p>
      )}
      <p className="sos-gauze-avail">{p.availability}</p>
    </div>
  )
}

/* —— System windows —— */
function ReadMe() {
  const os = useOs()
  return (
    <div className="sos-readme">
      <p className="sos-kicker">{studio.domain}</p>
      <h2 className="sos-display">{studio.line}</h2>
      <p className="sos-lede">{studio.about}</p>
      <ul className="sos-practice">
        {studio.practice.map((x, k) => (
          <li key={x.title}>
            <span>{String(k + 1).padStart(2, '0')}</span>
            <b>{x.title}</b>
            <em>{x.note}</em>
          </li>
        ))}
      </ul>
      <div className="sos-actions">
        <button type="button" className="sos-btn sos-btn-solid" onClick={() => os.open('status')}>
          See all work
        </button>
        <button type="button" className="sos-btn" onClick={os.openPalette}>
          Search {os.shell === 'desktop' && <kbd>{os.mod} K</kbd>}
        </button>
      </div>
    </div>
  )
}

function Status() {
  const os = useOs()
  const anyReal = products.some((p) => hasRealMedia(p.slug))
  return (
    <div className="sos-status">
      <table>
        <caption className="sos-kicker">
          {products.length} projects · stated as they are
        </caption>
        <thead>
          <tr>
            <th scope="col">No.</th>
            <th scope="col">Project</th>
            <th scope="col" className="sos-status-class">
              Class
            </th>
            <th scope="col">Stage</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.slug} style={hueVars(p)}>
              <td className="sos-status-cat">{p.catalog}</td>
              <th scope="row">
                <button type="button" onClick={() => os.open(p.slug)} aria-label={`Open ${p.name}`}>
                  <span className="sos-status-glyph">
                    <ProductGlyph motif={p.motif} size={18} />
                  </span>
                  {p.name}
                </button>
              </th>
              <td className="sos-status-class">{p.discipline}</td>
              <td>
                <StageChip p={p} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="sos-legend">
        {stages.map((s) => (
          <li key={s.id}>
            <b>{s.label}</b> {s.blurb}
          </li>
        ))}
      </ul>
      {!anyReal && <p className="sos-fineprint">No real captures added yet — every interface image in this build is a stamped placeholder.</p>}
    </div>
  )
}

function Contact() {
  return (
    <div className="sos-contact">
      <p className="sos-kicker">Contact</p>
      <p className="sos-display sos-domain">{studio.domain}</p>
      {studio.contactEmail ? (
        <a className="sos-btn sos-btn-solid" href={`mailto:${studio.contactEmail}`}>
          {studio.contactEmail}
        </a>
      ) : (
        <p className="sos-pending" role="note">
          <span aria-hidden="true" className="sos-pending-dot" />
          Contact channel wired in at launch. This prototype has no form or address connected.
        </p>
      )}
      <p className="sos-fineprint">{studio.about}</p>
    </div>
  )
}

function About() {
  const os = useOs()
  return (
    <div className="sos-about">
      <p className="sos-kicker">Concept 03 · Studio OS</p>
      <h2 className="sos-h2">Prototype build</h2>
      <p className="sos-lede">A design prototype of the {studio.name} website as a desktop. Nothing here is deployed, and nothing connects to a backend.</p>
      {os.shell === 'desktop' && (
        <dl className="sos-keys">
          <div>
            <dt>
              <kbd>{os.mod} K</kbd>
            </dt>
            <dd>Search projects and actions</dd>
          </div>
          <div>
            <dt>
              <kbd>Alt</kbd> <kbd>← ↑ ↓ →</kbd>
            </dt>
            <dd>Move the focused window</dd>
          </div>
          <div>
            <dt>
              <kbd>Esc</kbd>
            </dt>
            <dd>Close a menu or the search</dd>
          </div>
        </dl>
      )}
      <p className="sos-fineprint">
        Interface images marked PLACEHOLDER are schematics, not screenshots. Real captures replace them when files are added to <code>src/assets/products/</code>.
      </p>
    </div>
  )
}

export function AppContent({ app }: { app: AppDef }) {
  const p = app.product
  switch (app.id) {
    case 'samvisionai':
      return <SamVision p={p!} />
    case 'myfamilyexpenses':
      return <FamilyExpenses p={p!} />
    case 'gyst':
      return <Gyst p={p!} />
    case 'commandcenter':
      return <CommandCenter p={p!} />
    case 'gauzemate':
      return <GauzeMate p={p!} />
    case 'readme':
      return <ReadMe />
    case 'status':
      return <Status />
    case 'contact':
      return <Contact />
    case 'about':
      return <About />
    default:
      // Products added to the catalogue later get a sensible generic window.
      return p ? <Generic p={p} /> : null
  }
}

function Generic({ p }: { p: Product }) {
  return (
    <div className="sos-gyst" style={hueVars(p)}>
      <header className="sos-gyst-head">
        <div>
          <p className="sos-kicker">{p.discipline}</p>
          <h2 className="sos-h2">{p.name}</h2>
        </div>
        <p className="sos-tagline">{p.tagline}</p>
      </header>
      <div className="sos-tabpanel">
        <div className={`sos-fit sos-fit-${p.primarySurface} sos-fit-ruled`}>
          {p.primarySurface === 'desktop' ? (
            <ProductMedia product={p} />
          ) : (
            <PhoneFrame>
              <ProductMedia product={p} />
            </PhoneFrame>
          )}
        </div>
      </div>
      <Meta p={p} className="sos-meta-row" />
    </div>
  )
}
