import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { productBySlug, products, stages, studio } from '../../data/products'
import { ProductMedia } from '../../media/ProductMedia'
import { usePrefersReducedMotion } from '../../shared/env'
import { AppGlyph, appById, apps, type AppDef } from './apps'
import { AppContent, OsContext, StageChip, type OsApi } from './content'
import { Clock } from './MenuBar'
import { buildActions, Palette } from './Palette'

function Sheet({ app, reduced, onClose }: { app: AppDef; reduced: boolean; onClose: () => void }) {
  const close = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    close.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  const t = reduced ? { duration: 0 } : { type: 'spring' as const, stiffness: 380, damping: 38 }
  return (
    <>
      <motion.div className="sos-sheet-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.18 }} onClick={onClose} />
      <motion.section
        className={`sos-sheet ${app.dark ? 'is-dark' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={app.title}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={t}
      >
        <header className="sos-sheet-bar">
          <div>
            <span className="sos-win-title">
              <span className="sos-win-glyph" style={app.product ? { color: app.dark ? app.product.hue.bright : app.product.hue.ink } : undefined}>
                <AppGlyph app={app} size={18} />
              </span>
              {app.title}
            </span>
            <span className="sos-win-tag">{app.product ? `${app.product.catalog} · ${app.product.stageLabel}` : 'System'}</span>
          </div>
          <button ref={close} type="button" className="sos-sheet-close" onClick={onClose} aria-label={`Close ${app.title}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </header>
        <div className="sos-win-body sos-sheet-body">
          <AppContent app={app} />
        </div>
      </motion.section>
    </>
  )
}

const dockIcon = {
  home: <path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1v-7.5Z" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="m15.2 15.2 4.8 4.8" />
    </>
  ),
}

/** Phone shell: a home screen. Apps open as full-height sheets; nothing is draggable. */
export default function Mobile() {
  const reduced = usePrefersReducedMotion()
  const [sheet, setSheet] = useState<string | null>(null)
  const [search, setSearch] = useState(false)
  const opener = useRef<HTMLElement | null>(null)

  const open = useCallback((id: string) => {
    if (!opener.current) opener.current = document.activeElement as HTMLElement
    setSearch(false)
    setSheet(id)
  }, [])
  const closeSheet = useCallback(() => {
    setSheet(null)
    const el = opener.current
    opener.current = null
    requestAnimationFrame(() => el?.isConnected && el.focus({ preventScroll: true }))
  }, [])

  useEffect(() => {
    document.documentElement.style.overflow = sheet || search ? 'hidden' : ''
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [sheet, search])

  const os: OsApi = useMemo(() => ({ open, openPalette: () => setSearch(true), mod: '', shell: 'mobile' }), [open])
  const actions = useMemo(() => buildActions(open), [open])
  const sam = productBySlug('samvisionai')!
  const covered = !!sheet || search

  return (
    <OsContext.Provider value={os}>
      <div className="sos sos-m">
        <div className="sos-m-home" inert={covered}>
          <header className="sos-m-status">
            <Clock />
            <span className="sos-build">
              <i aria-hidden="true" />
              Prototype build
            </span>
          </header>

          <section className="sos-m-hero">
            <p className="sos-kicker">{studio.domain}</p>
            <h1 className="sos-m-word">
              Zaylo<span>Labs</span>
            </h1>
            <p className="sos-m-line">{studio.line}</p>
          </section>

          <button type="button" className="sos-m-feature" onClick={() => open(sam.slug)} aria-label={`Open ${sam.name}`} style={{ '--hue': sam.hue.ink, '--sch-accent': sam.hue.ink } as CSSProperties}>
            <span className="sos-m-feature-bar">
              <span>
                <span style={{ color: sam.hue.ink, display: 'inline-flex' }}>
                  <AppGlyph app={appById(sam.slug)} size={16} />
                </span>
                {sam.name}
              </span>
              <StageChip p={sam} />
            </span>
            <ProductMedia product={sam} surface="desktop" priority />
            <span className="sos-m-feature-cap">
              <span>{sam.tagline}</span>
              <span>Open →</span>
            </span>
          </button>

          <p className="sos-m-label">Work &amp; studio</p>
          <ul className="sos-m-grid">
            {apps.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  className={`sos-m-app ${a.kind === 'system' ? 'is-system' : ''}`}
                  onClick={() => open(a.id)}
                  style={a.product ? ({ '--hue': a.product.hue.ink, '--hue-wash': a.product.hue.wash } as CSSProperties) : undefined}
                >
                  <span className="sos-m-app-ico">
                    <AppGlyph app={a} size={28} />
                  </span>
                  <b>{a.product ? a.product.name : a.title}</b>
                  <small>{a.product ? a.product.stageLabel : 'System'}</small>
                </button>
              </li>
            ))}
          </ul>

          <footer className="sos-m-foot">
            <span>
              {products.length} projects — {stages.map((st) => `${products.filter((p) => p.stage === st.id).length} ${st.label.toLowerCase()}`).join(' · ')}
            </span>
            <span>Every interface image is a real capture or a stamped placeholder</span>
            <span>Prototype build · not deployed</span>
          </footer>
        </div>

        <nav className="sos-m-dock" aria-label="Dock" inert={covered}>
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
              {dockIcon.home}
            </svg>
            Home
          </button>
          <button type="button" onClick={() => setSearch(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
              {dockIcon.search}
            </svg>
            Search
          </button>
          <button type="button" onClick={() => open('status')}>
            <AppGlyph app={appById('status')} size={20} />
            Status
          </button>
          <button type="button" onClick={() => open('contact')}>
            <AppGlyph app={appById('contact')} size={20} />
            Contact
          </button>
        </nav>

        <AnimatePresence>{sheet && <Sheet key={sheet} app={appById(sheet)} reduced={reduced} onClose={closeSheet} />}</AnimatePresence>
        {search && <Palette actions={actions} onClose={() => setSearch(false)} />}
      </div>
    </OsContext.Provider>
  )
}
