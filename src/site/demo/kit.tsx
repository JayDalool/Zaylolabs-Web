/**
 * Demo kit — small building blocks for the redrawn app walkthroughs.
 * They draw a simplified version of each app's real screens, in that app's own
 * colours, type and wording (see skins.css), filled with made-up data. They
 * are not screenshots and never pretend to be: every demo is labelled.
 */
import type { CSSProperties, ReactNode } from 'react'

/** Moves the walkthrough on. Scenes receive it so a click inside the "app" advances the demo. */
export type Go = () => void
/** Meaning, never decoration: each app maps these to its own status colours. */
export type Tone = 'ok' | 'warn' | 'bad' | 'info' | 'idle' | 'accent' | 'violet'

export function Head({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="dm-head">
      <b>{children}</b>
      {sub && <span>{sub}</span>}
    </div>
  )
}

/** A button inside the app. `go` makes it the highlighted next action. */
export function Btn({ children, go, ghost, wide, small }: { children: ReactNode; go?: Go; ghost?: boolean; wide?: boolean; small?: boolean }) {
  return (
    <button type="button" className={`dm-btn ${ghost ? 'dm-btn-ghost' : ''} ${go ? 'dm-hot' : ''}`} data-wide={wide || undefined} data-small={small || undefined} onClick={go} tabIndex={go ? 0 : -1} aria-disabled={go ? undefined : true}>
      {children}
    </button>
  )
}

/** A form field. `type` plays the value in as if it were being typed. */
export function Field({ label, value, type, delay = 0, chip, tone, hint }: { label: string; value: string; type?: boolean; delay?: number; chip?: string; tone?: Tone; hint?: string }) {
  return (
    <div className="dm-field" data-tone={tone}>
      <span>
        {label}
        {chip && <i className="dm-field-chip">{chip}</i>}
      </span>
      <b className={type ? 'dm-type' : ''} style={type ? ({ '--n': value.length, animationDelay: `${delay}ms` } as CSSProperties) : undefined}>
        {value}
      </b>
      {hint && <small>{hint}</small>}
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

export function Table({ head, rows, mark, num = [], dim = [], wide = [] }: { head: string[]; rows: ReactNode[][]; mark?: number; num?: number[]; dim?: number[]; /** columns shown only when the screen is wide */ wide?: number[] }) {
  return (
    <table className="dm-table">
      <thead>
        <tr>
          {head.map((h, j) => (
            <th key={h} data-num={num.includes(j) || undefined} data-wide={wide.includes(j) || undefined}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} data-mark={i === mark || undefined} data-dim={dim.includes(i) || undefined}>
            {r.map((c, j) => (
              <td key={j} data-num={num.includes(j) || undefined} data-wide={wide.includes(j) || undefined}>
                {c}
              </td>
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
export function Receipt({ small, shop = 'NORTHGATE FRESH MARKET', total = '20.97' }: { small?: boolean; shop?: string; total?: string }) {
  return (
    <div className="dm-receipt" data-small={small || undefined} role="img" aria-label="Sample receipt image">
      <b>{shop}</b>
      <i />
      <i />
      <i />
      <i />
      <span>TOTAL {total}</span>
    </div>
  )
}

/** A made-up file chooser. The highlighted file is the one the demo uses. */
export function Files({ files, pick, go, title = 'Choose a photo' }: { files: [string, string][]; pick: number; go: Go; title?: string }) {
  return (
    <div className="dm-files" role="group" aria-label="Sample files">
      <p>{title}</p>
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

/* ————— pieces shared by the app skins ————— */

/** A status word. With `dot` it is a dot and a word; otherwise a small tinted tag. */
export function Pill({ children, tone = 'idle', dot }: { children: ReactNode; tone?: Tone; dot?: boolean }) {
  return (
    <span className="dm-pill" data-tone={tone} data-dot={dot || undefined}>
      {children}
    </span>
  )
}

export function Banner({ tone = 'info', title, children }: { tone?: Tone; title: string; children?: ReactNode }) {
  return (
    <p className="dm-banner" data-tone={tone}>
      <b>{title}</b> {children}
    </p>
  )
}

/** The one dominant number on a screen, with its label and the line under it. */
export function Figure({ label, value, sub, side, dim }: { label: string; value: string; sub?: ReactNode; side?: ReactNode; dim?: boolean }) {
  return (
    <div className="dm-figure" data-dim={dim || undefined}>
      <div>
        <span>{label}</span>
        <b>{value}</b>
        {sub && <small>{sub}</small>}
      </div>
      {side}
    </div>
  )
}

export function Kpis({ items }: { items: [string, string, Tone?][] }) {
  return (
    <div className="dm-kpis">
      {items.map(([k, v, tone]) => (
        <div key={k} data-tone={tone}>
          <span>{k}</span>
          <b>{v}</b>
        </div>
      ))}
    </div>
  )
}

/** Rows of label and amount, with a total under a rule. */
export function Ledger({ rows, total }: { rows: [string, string][]; total?: [string, string] }) {
  return (
    <div className="dm-ledger">
      {rows.map(([k, v]) => (
        <div key={k}>
          <span>{k}</span>
          <b>{v}</b>
        </div>
      ))}
      {total && (
        <div data-total="">
          <span>{total[0]}</span>
          <b>{total[1]}</b>
        </div>
      )}
    </div>
  )
}

/** A row of tabs or segments inside the app; `on` is the selected one. */
export function Tabs({ items, on = 0, seg }: { items: string[]; on?: number; seg?: boolean }) {
  return (
    <div className="dm-tabsrow" data-seg={seg || undefined}>
      {items.map((x, i) => (
        <span key={x} data-on={i === on || undefined}>
          {x}
        </span>
      ))}
    </div>
  )
}

/** Numbered steps of a wizard. */
export function Stepper({ items, at }: { items: string[]; at: number }) {
  return (
    <div className="dm-stepper">
      {items.map((x, i) => (
        <span key={x} data-state={i < at ? 'done' : i === at ? 'now' : 'next'}>
          <i>{i < at ? '✓' : i + 1}</i>
          {x}
        </span>
      ))}
    </div>
  )
}

/** Count tiles. `pick` makes one tile the highlighted next action. */
export function Tiles({ items, pick, go, on }: { items: [string, string, Tone?][]; pick?: number; go?: Go; on?: number }) {
  return (
    <div className="dm-tiles">
      {items.map(([n, label, tone], i) =>
        i === pick && go ? (
          <button key={label} type="button" className="dm-tile dm-hot" data-tone={tone} data-long={n.length > 6 || undefined} onClick={go}>
            <b>{n}</b>
            <span>{label}</span>
          </button>
        ) : (
          <div key={label} className="dm-tile" data-tone={tone} data-on={i === on || undefined} data-long={n.length > 6 || undefined}>
            <b>{n}</b>
            <span>{label}</span>
          </div>
        ),
      )}
    </div>
  )
}

/** A decision that waits for a person: a tinted card with a coloured edge and its actions. */
export function Gate({ tone = 'accent', title, children, actions }: { tone?: Tone; title: string; children?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="dm-gate" data-tone={tone}>
      <b>{title}</b>
      {children && <p>{children}</p>}
      {actions && <div className="dm-gate-actions">{actions}</div>}
    </div>
  )
}

export function Bubble({ me, children }: { me?: boolean; children: ReactNode }) {
  return (
    <div className="dm-bubble" data-me={me || undefined}>
      {children}
    </div>
  )
}

/** A ring that fills to `pct`, with a number in the middle. */
export function Ring({ pct, value, label }: { pct: number; value: string; label: string }) {
  const c = 2 * Math.PI * 34
  return (
    <div className="dm-ring" role="img" aria-label={`${value} ${label}`}>
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <circle cx="40" cy="40" r="34" />
        <circle cx="40" cy="40" r="34" strokeDasharray={`${(c * pct) / 100} ${c}`} transform="rotate(-90 40 40)" />
      </svg>
      <span>
        <b>{value}</b>
        <small>{label}</small>
      </span>
    </div>
  )
}

/** A score with its small bar. */
export function Meter({ value, tone = 'ok' }: { value: number; tone?: Tone }) {
  return (
    <span className="dm-meter" data-tone={tone}>
      {value}
      <i>
        <b style={{ width: `${value}%` }} />
      </i>
    </span>
  )
}

export function Toggle({ on }: { on?: boolean }) {
  return <i className="dm-toggle" data-on={on || undefined} aria-hidden="true" />
}

/** An app's own frame: a side rail (desktop) or a header and tab bar (phone), then the page. */
export function Shell({
  brand,
  sub,
  nav,
  on,
  title,
  tag,
  actions,
  tabs,
  phone,
  hot,
  go,
  children,
}: {
  brand: ReactNode
  sub?: string
  /** Rail groups on desktop, or the bottom tabs on a phone. A string starting with "#" is a group heading. */
  nav: string[]
  on: string
  title?: ReactNode
  tag?: string
  actions?: ReactNode
  tabs?: ReactNode
  phone?: boolean
  /** A nav item that is the highlighted next action. */
  hot?: string
  go?: Go
  children: ReactNode
}) {
  const item = (x: string, icon?: boolean) =>
    x === hot && go ? (
      <button key={x} type="button" className="ap-nav dm-hot" onClick={go}>
        {icon && <i />}
        {x}
      </button>
    ) : (
      <span key={x} className="ap-nav" data-on={x === on || undefined} aria-hidden="true">
        {icon && <i />}
        {x}
      </span>
    )
  if (phone)
    return (
      <div className="ap" data-shell="phone">
        <div className="ap-bar">
          <b className="ap-brand">{brand}</b>
          {sub && <span>{sub}</span>}
        </div>
        <div className="ap-body">{children}</div>
        <div className="ap-tabbar">{nav.map((x) => item(x, true))}</div>
      </div>
    )
  return (
    <div className="ap" data-shell="rail">
      <div className="ap-rail">
        <b className="ap-brand" aria-hidden="true">
          {brand}
        </b>
        {sub && <small aria-hidden="true">{sub}</small>}
        {nav.map((x) =>
          x.startsWith('#') ? (
            <em key={x} aria-hidden="true">
              {x.slice(1)}
            </em>
          ) : (
            item(x)
          ),
        )}
      </div>
      <div className="ap-main">
        {title && (
          <div className="ap-top">
            <b>{title}</b>
            {tag && <span>{tag}</span>}
            {actions && <div>{actions}</div>}
          </div>
        )}
        {tabs}
        <div className="ap-body">{children}</div>
      </div>
    </div>
  )
}
