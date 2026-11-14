import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { products } from '../../data/products'
import { ZMark } from './apps'

export interface MenuItem {
  label: string
  note?: string
  onSelect: () => void
  disabled?: boolean
}
export interface MenuDef {
  id: string
  label: ReactNode
  ariaLabel?: string
  items: MenuItem[]
}

export function Clock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15_000)
    return () => clearInterval(t)
  }, [])
  const text = new Intl.DateTimeFormat(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' }).format(now)
  return (
    <time className="sos-clock" dateTime={now.toISOString()}>
      {text}
    </time>
  )
}

export function MenuBar({ menus, onPalette, mod }: { menus: MenuDef[]; onPalette: () => void; mod: string }) {
  const [open, setOpen] = useState<string | null>(null)
  const bar = useRef<HTMLDivElement>(null)
  const hovered = useRef<string | null>(null)

  useEffect(() => {
    if (!open) return
    const away = (e: PointerEvent) => {
      if (!bar.current?.contains(e.target as Node)) setOpen(null)
    }
    window.addEventListener('pointerdown', away)
    return () => window.removeEventListener('pointerdown', away)
  }, [open])

  const focusItem = (menuId: string, idx: number | 'last') => {
    requestAnimationFrame(() => {
      const list = bar.current?.querySelectorAll<HTMLButtonElement>(`[data-menu="${menuId}"] [role="menuitem"]:not(:disabled)`)
      if (!list?.length) return
      list[idx === 'last' ? list.length - 1 : Math.max(0, Math.min(list.length - 1, idx))].focus()
    })
  }

  const onTriggerKey = (e: KeyboardEvent, m: MenuDef, i: number) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen(m.id)
      focusItem(m.id, 0)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setOpen(m.id)
      focusItem(m.id, 'last')
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const n = menus[(i + (e.key === 'ArrowRight' ? 1 : -1) + menus.length) % menus.length]
      bar.current?.querySelector<HTMLButtonElement>(`[data-trigger="${n.id}"]`)?.focus()
      if (open) setOpen(n.id)
    } else if (e.key === 'Escape') setOpen(null)
  }

  const onMenuKey = (e: KeyboardEvent, m: MenuDef, i: number) => {
    const items = Array.from(bar.current?.querySelectorAll<HTMLButtonElement>(`[data-menu="${m.id}"] [role="menuitem"]:not(:disabled)`) ?? [])
    const at = items.indexOf(document.activeElement as HTMLButtonElement)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      items[(at + 1) % items.length]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      items[(at - 1 + items.length) % items.length]?.focus()
    } else if (e.key === 'Home') {
      e.preventDefault()
      items[0]?.focus()
    } else if (e.key === 'End') {
      e.preventDefault()
      items[items.length - 1]?.focus()
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      if (e.key === 'Escape') e.preventDefault()
      setOpen(null)
      bar.current?.querySelector<HTMLButtonElement>(`[data-trigger="${m.id}"]`)?.focus()
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const n = menus[(i + (e.key === 'ArrowRight' ? 1 : -1) + menus.length) % menus.length]
      setOpen(n.id)
      focusItem(n.id, 0)
    }
  }

  return (
    <header className="sos-menubar">
      <div className="sos-menus" ref={bar}>
        {menus.map((m, i) => (
          <div key={m.id} className={`sos-menu ${open === m.id ? 'is-open' : ''}`}>
            <button
              type="button"
              className={`sos-menu-trigger ${i === 0 ? 'is-brand' : ''}`}
              data-trigger={m.id}
              aria-haspopup="menu"
              aria-expanded={open === m.id}
              aria-label={m.ariaLabel}
              onClick={() => {
                // Hover already switched to this menu: the click confirms it rather than closing it.
                if (hovered.current === m.id) return void (hovered.current = null)
                setOpen(open === m.id ? null : m.id)
              }}
              onPointerEnter={(e) => {
                if (e.pointerType === 'mouse' && open && open !== m.id) {
                  hovered.current = m.id
                  setOpen(m.id)
                }
              }}
              onPointerLeave={() => (hovered.current = null)}
              onKeyDown={(e) => onTriggerKey(e, m, i)}
            >
              {m.label}
            </button>
            {open === m.id && (
              <div className="sos-menu-pop" role="menu" data-menu={m.id} aria-label={m.ariaLabel ?? (typeof m.label === 'string' ? m.label : undefined)} onKeyDown={(e) => onMenuKey(e, m, i)}>
                {m.items.map((it) => (
                  <button
                    key={it.label}
                    type="button"
                    role="menuitem"
                    disabled={it.disabled}
                    onClick={() => {
                      setOpen(null)
                      it.onSelect()
                    }}
                  >
                    <span>{it.label}</span>
                    {it.note && <span className="sos-menu-note">{it.note}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="sos-menubar-right">
        <button type="button" className="sos-search" onClick={onPalette} aria-label="Search projects and actions" aria-keyshortcuts={mod === '⌘' ? 'Meta+K' : 'Control+K'}>
          <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
            <path d="m15.5 15.5 5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          <span>Search</span>
          <kbd>{mod} K</kbd>
        </button>
        <span className="sos-build" title="Design prototype — not deployed">
          <i aria-hidden="true" />
          Prototype build
        </span>
        <Clock />
      </div>
    </header>
  )
}

export function brandLabel() {
  return (
    <>
      <ZMark size={15} />
      <span>ZayloLabs</span>
    </>
  )
}

export const workItems = (open: (id: string) => void): MenuItem[] => products.map((p) => ({ label: p.name, note: p.stageLabel, onSelect: () => open(p.slug) }))
