import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { AppGlyph, apps, type AppDef } from './apps'

export interface PaletteAction {
  id: string
  label: string
  hint: string
  group: 'Work' | 'Studio' | 'Desktop'
  app?: AppDef
  keywords?: string
  run: () => void
}

/** Subsequence match with bonuses for runs and word starts. -1 = no match. */
function fuzzy(query: string, text: string): number {
  const q = query.toLowerCase().replace(/\s+/g, '')
  if (!q) return 0
  const t = text.toLowerCase()
  let score = 0
  let ti = 0
  let streak = 0
  for (const ch of q) {
    const at = t.indexOf(ch, ti)
    if (at === -1) return -1
    streak = at === ti ? streak + 1 : 0
    score += 1 + streak * 2 + (at === 0 || /[\s/·-]/.test(t[at - 1]) ? 4 : 0) - Math.min(3, (at - ti) * 0.2)
    ti = at + 1
  }
  return score
}

export function buildActions(open: (id: string) => void, desk?: { tidy: () => void; cascade: () => void; closeAll: () => void; reset: () => void }): PaletteAction[] {
  const list: PaletteAction[] = apps.map((a) => ({
    id: a.id,
    label: a.kind === 'product' ? `Open ${a.title}` : a.title,
    hint: a.hint,
    group: a.kind === 'product' ? 'Work' : 'Studio',
    app: a,
    keywords: a.product ? `${a.product.discipline} ${a.product.stageLabel} ${a.product.catalog} ${a.product.focus.map((f) => f.title).join(' ')}` : '',
    run: () => open(a.id),
  }))
  if (desk) {
    list.push(
      { id: 'tidy', label: 'Tidy windows', hint: 'Arrange open windows side by side', group: 'Desktop', run: desk.tidy },
      { id: 'cascade', label: 'Cascade windows', hint: 'Stack open windows diagonally', group: 'Desktop', run: desk.cascade },
      { id: 'closeall', label: 'Close all windows', hint: 'Clear the desktop', group: 'Desktop', run: desk.closeAll },
      { id: 'reset', label: 'Reset desktop', hint: 'Back to the opening arrangement', group: 'Desktop', run: desk.reset },
    )
  }
  return list
}

export function Palette({ actions, onClose }: { actions: PaletteAction[]; onClose: () => void }) {
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const uid = useId()
  // Captured during render: by the time effects run, the shell behind is inert and has already lost focus.
  const [returnTo] = useState(() => document.activeElement as HTMLElement | null)

  const results = useMemo(() => {
    if (!q.trim()) return actions
    return actions
      .map((a) => ({ a, s: Math.max(fuzzy(q, a.label) * 1.5, fuzzy(q, a.hint), fuzzy(q, a.keywords ?? '') * 0.8) }))
      .filter((x) => x.s > 0)
      .sort((x, y) => y.s - x.s)
      .map((x) => x.a)
  }, [q, actions])

  useEffect(() => {
    input.current?.focus()
    return () => {
      // Hand focus back unless the chosen action already moved it somewhere meaningful.
      if (returnTo?.isConnected && (document.activeElement === document.body || !document.activeElement)) returnTo.focus({ preventScroll: true })
    }
  }, [returnTo])

  useEffect(() => {
    list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const choose = (a?: PaletteAction) => {
    if (!a) return
    onClose()
    a.run()
  }

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (results.length ? (i + 1) % results.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0))
    } else if (e.key === 'Home') {
      e.preventDefault()
      setActive(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      setActive(Math.max(0, results.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      choose(results[active])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'Tab') {
      // Focus trap: the input and the close button are the only tab stops.
      const stops = [input.current, document.getElementById(`${uid}-close`)] as (HTMLElement | null)[]
      e.preventDefault()
      const at = stops.indexOf(document.activeElement as HTMLElement)
      stops[(at + 1) % stops.length]?.focus()
    }
  }

  return (
    <div className="sos-pal-scrim" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sos-pal" role="dialog" aria-modal="true" aria-label="Search projects and actions" onKeyDown={onKey}>
        <div className="sos-pal-field">
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="m15.5 15.5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            ref={input}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={`${uid}-list`}
            aria-activedescendant={results[active] ? `${uid}-o-${results[active].id}` : undefined}
            aria-autocomplete="list"
            aria-label="Search projects and actions"
            placeholder="Open a project, or do something…"
            autoComplete="off"
            spellCheck={false}
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setActive(0)
            }}
          />
          <button type="button" id={`${uid}-close`} className="sos-pal-esc" onClick={onClose} aria-label="Close search">
            esc
          </button>
        </div>
        <ul ref={list} className="sos-pal-list" role="listbox" id={`${uid}-list`} aria-label="Results">
          {results.map((a, i) => {
            const head = !q.trim() && (i === 0 || results[i - 1].group !== a.group) ? a.group : null
            return (
              <li key={a.id} role="presentation">
                {head && (
                  <p className="sos-pal-group" role="presentation">
                    {head}
                  </p>
                )}
                <div
                  role="option"
                  id={`${uid}-o-${a.id}`}
                  aria-selected={i === active}
                  className={`sos-pal-opt ${i === active ? 'is-active' : ''}`}
                  onPointerMove={() => i !== active && setActive(i)}
                  onClick={() => choose(a)}
                >
                  <span className="sos-pal-ico" style={a.app?.product ? { background: a.app.product.hue.wash, color: a.app.product.hue.ink } : undefined}>
                    {a.app ? (
                      <AppGlyph app={a.app} size={18} />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M5 7h14M5 12h14M5 17h8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    )}
                  </span>
                  <span className="sos-pal-label">{a.label}</span>
                  <span className="sos-pal-hint">{a.hint}</span>
                  <span className="sos-pal-enter" aria-hidden="true">
                    ↵
                  </span>
                </div>
              </li>
            )
          })}
          {results.length === 0 && (
            <li className="sos-pal-empty" role="presentation">
              Nothing matches “{q}”.
            </li>
          )}
        </ul>
        <p className="sos-pal-foot" aria-hidden="true">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> move
          </span>
          <span>
            <kbd>↵</kbd> open
          </span>
          <span>
            <kbd>esc</kbd> close
          </span>
        </p>
      </div>
    </div>
  )
}
