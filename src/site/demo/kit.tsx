/**
 * Demo kit — small building blocks for the illustrated app walkthroughs.
 * These draw a simplified, made-up interface. They are not screenshots and
 * never pretend to be: every demo is labelled as sample data.
 */
import type { CSSProperties, ReactNode } from 'react'

/** Moves the walkthrough on. Scenes receive it so a click inside the "app" advances the demo. */
export type Go = () => void

export function Head({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="dm-head">
      <b>{children}</b>
      {sub && <span>{sub}</span>}
    </div>
  )
}

/** A button inside the app. `go` makes it the highlighted next action. */
export function Btn({ children, go, ghost, wide }: { children: ReactNode; go?: Go; ghost?: boolean; wide?: boolean }) {
  return (
    <button type="button" className={`dm-btn ${ghost ? 'dm-btn-ghost' : ''} ${go ? 'dm-hot' : ''}`} data-wide={wide || undefined} onClick={go} tabIndex={go ? 0 : -1} aria-disabled={go ? undefined : true}>
      {children}
    </button>
  )
}

/** A form field. `type` plays the value in as if it were being typed. */
export function Field({ label, value, type, delay = 0 }: { label: string; value: string; type?: boolean; delay?: number }) {
  return (
    <div className="dm-field">
      <span>{label}</span>
      <b className={type ? 'dm-type' : ''} style={type ? ({ '--n': value.length, animationDelay: `${delay}ms` } as CSSProperties) : undefined}>
        {value}
      </b>
    </div>
  )
}

export function Row({ title, meta, value, fresh, clip, tick }: { title: string; meta?: string; value?: string; fresh?: boolean; clip?: boolean; tick?: boolean }) {
  return (
    <div className="dm-row" data-fresh={fresh || undefined}>
      {tick !== undefined && <i className="dm-tick" data-on={tick || undefined} aria-hidden="true" />}
      <span>
        <b>{title}</b>
        {meta && <small>{meta}</small>}
      </span>
      {clip && (
        <svg className="dm-clip" width="14" height="14" viewBox="0 0 14 14" aria-label="receipt attached">
          <path d="M9.5 3.5 5 8a1.6 1.6 0 0 0 2.3 2.3l4.2-4.2a2.8 2.8 0 0 0-4-4L3 6.6a4 4 0 0 0 5.7 5.7l3.1-3.1" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )}
      {value && <em>{value}</em>}
    </div>
  )
}

export function Kv({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="dm-kv" data-strong={strong || undefined}>
      <span>{k}</span>
      <b>{v}</b>
    </div>
  )
}

export function Card({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <div className="dm-card">
      {title && <p className="dm-card-title">{title}</p>}
      {children}
    </div>
  )
}

/** Horizontal bars: [label, value text, percent]. */
export function Bars({ rows }: { rows: [string, string, number][] }) {
  return (
    <div className="dm-bars">
      {rows.map(([label, value, pct], i) => (
        <div key={label}>
          <span>{label}</span>
          <i>
            <b style={{ width: `${pct}%`, animationDelay: `${i * 90}ms` }} />
          </i>
          <em>{value}</em>
        </div>
      ))}
    </div>
  )
}

export function Table({ head, rows, mark }: { head: string[]; rows: string[][]; mark?: number }) {
  return (
    <table className="dm-table">
      <thead>
        <tr>
          {head.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r[0]} data-mark={i === mark || undefined}>
            {r.map((c, j) => (
              <td key={j}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function Chips({ items, on = [] }: { items: string[]; on?: number[] }) {
  return (
    <div className="dm-chips">
      {items.map((c, i) => (
        <span key={c} data-on={on.includes(i) || undefined}>
          {c}
        </span>
      ))}
    </div>
  )
}

export function Toast({ children }: { children: ReactNode }) {
  return (
    <div className="dm-toast" role="status">
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <path d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>{children}</span>
    </div>
  )
}

/** A drawn receipt — the sample "photo". */
export function Receipt({ small }: { small?: boolean }) {
  return (
    <div className="dm-receipt" data-small={small || undefined} aria-label="Sample receipt image">
      <b>CORNER MARKET</b>
      <i />
      <i />
      <i />
      <i />
      <span>TOTAL 84.20</span>
    </div>
  )
}

/** The place a receipt photo goes: an in-page uploader, nothing leaves the browser. */
export function Dropzone({ children }: { children: ReactNode }) {
  return (
    <div className="dm-drop">
      <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
        <path d="M4 10h5l2-3h8l2 3h5v14H4V10Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        <circle cx="15" cy="16.5" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      </svg>
      {children}
    </div>
  )
}

/** A made-up file chooser. The highlighted file is the one the demo uses. */
export function Files({ files, pick, go }: { files: [string, string][]; pick: number; go: Go }) {
  return (
    <div className="dm-files" role="group" aria-label="Sample files">
      <p>Choose a photo</p>
      {files.map(([name, size], i) =>
        i === pick ? (
          <button key={name} type="button" className="dm-file dm-hot" onClick={go}>
            <i aria-hidden="true" />
            <b>{name}</b>
            <span>{size}</span>
          </button>
        ) : (
          <div key={name} className="dm-file" data-dim="">
            <i aria-hidden="true" />
            <b>{name}</b>
            <span>{size}</span>
          </div>
        ),
      )}
    </div>
  )
}

export function Progress({ label }: { label: string }) {
  return (
    <div className="dm-progress">
      <span>{label}</span>
      <i>
        <b />
      </i>
    </div>
  )
}

/** A document preview: a title and ruled lines standing in for text. */
export function Doc({ title, sections }: { title: string; sections: string[] }) {
  return (
    <div className="dm-doc">
      <b>{title}</b>
      {sections.map((s) => (
        <div key={s}>
          <span>{s}</span>
          <i />
          <i />
        </div>
      ))}
    </div>
  )
}

export function Log({ lines }: { lines: string[] }) {
  return (
    <div className="dm-log">
      {lines.map((l, i) => (
        <p key={l} style={{ animationDelay: `${i * 420}ms` }}>
          {l}
        </p>
      ))}
    </div>
  )
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="dm-note">{children}</p>
}

export function Cols({ children }: { children: ReactNode }) {
  return <div className="dm-cols">{children}</div>
}
