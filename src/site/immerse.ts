/**
 * Immersion — a section that belongs to one app takes on that app's colours
 * while the visitor is in it.
 *
 * A section is "in" as soon as it reaches the middle band of the screen, on
 * every kind of device: the colour arrives with the section while it is still
 * scrolling in, with no wait for the pointer to move. Keyboard focus inside a
 * section counts as well. On a mouse the app's light also follows the pointer.
 *
 * The hook only reports on/off and tracks the pointer; all colour lives in CSS
 * (`.sp-immersive[data-immersed]` in specimen.css), driven by the product's hue.
 */
import { useEffect, useState } from 'react'

/** The middle fifth of the screen: a section crossing it is the one the visitor is in. */
const BAND = '-40% 0px -40% 0px'

export function useImmerse<T extends HTMLElement>() {
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

  return { ref, on }
}
