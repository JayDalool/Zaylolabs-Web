/**
 * Immersion — a section that belongs to one app takes on that app's colours
 * while the visitor is in it, and the site header follows.
 *
 * A section is "in" as soon as it reaches the middle band of the screen, on
 * every kind of device: the colour arrives with the section while it is still
 * scrolling in, with no wait for the pointer to move. Keyboard focus inside a
 * section counts as well. On a mouse the app's light also follows the pointer.
 *
 * The hook only reports on/off and tracks the pointer; all colour lives in CSS
 * (`.sp-immersive[data-immersed]` in specimen.css), driven by the product's hue.
 */
import { useEffect, useState, useSyncExternalStore } from 'react'

/* ——— which app the visitor is in right now (read by the header) ——— */
// Several places can be "in" an app at once (a section on screen, the hero pointing at the same app).
// Each reports under its own key; the most recent one still reporting wins.
const active: { key: symbol; slug: string }[] = []
let current: string | null = null
const listeners = new Set<() => void>()
const subscribe = (l: () => void) => (listeners.add(l), () => void listeners.delete(l))
function update() {
  const next = active.at(-1)?.slug ?? null
  if (next === current) return
  current = next
  listeners.forEach((l) => l())
}
/** The slug of the app whose section the visitor is in, or null. */
export const useCurrentApp = () =>
  useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  )

/** Reports an app as the one the visitor is in, for as long as `on` is true. */
export function useReportApp(slug: string | undefined, on: boolean) {
  useEffect(() => {
    if (!slug || !on) return
    const entry = { key: Symbol(slug), slug }
    active.push(entry)
    update()
    return () => {
      active.splice(active.indexOf(entry), 1)
      update()
    }
  }, [slug, on])
}

/** The middle fifth of the screen: a section crossing it is the one the visitor is in. */
const BAND = '-40% 0px -40% 0px'

export function useImmerse<T extends HTMLElement>(slug?: string) {
  // The element is held in state so the listeners follow it if it is replaced (e.g. one product page to the next).
  const [el, ref] = useState<T | null>(null)
  const [inView, setInView] = useState(false)
  const [focused, setFocused] = useState(false)
  const on = inView || focused

  useEffect(() => {
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: BAND })
    io.observe(el)
    // only keyboard focus counts; a click inside is already in view
    const focusIn = (e: FocusEvent) => (e.target as HTMLElement).matches?.(':focus-visible') && setFocused(true)
    const focusOut = () => setFocused(false)
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${Math.round(e.clientX - r.left)}px`)
      el.style.setProperty('--my', `${Math.round(e.clientY - r.top)}px`)
    }
    el.addEventListener('pointermove', move, { passive: true })
    el.addEventListener('focusin', focusIn)
    el.addEventListener('focusout', focusOut)
    return () => {
      io.disconnect()
      el.removeEventListener('pointermove', move)
      el.removeEventListener('focusin', focusIn)
      el.removeEventListener('focusout', focusOut)
    }
  }, [el])

  useReportApp(slug, on)
  return { ref, on }
}
