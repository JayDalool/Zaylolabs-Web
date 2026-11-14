/**
 * Immersion — a section that belongs to one app takes on that app's colours
 * while the visitor is in it.
 *
 *   mouse     → while the pointer is over the section (with a short settle, so
 *               passing through on the way elsewhere does not flash)
 *   keyboard  → while focus is inside it
 *   touch     → while it is the section crossing the middle of the screen
 *
 * The hook only reports on/off and tracks the pointer; all colour lives in CSS
 * (`.sp-immersive[data-immersed]` in specimen.css), driven by the product's hue.
 */
import { useEffect, useRef, useState } from 'react'
import { useMediaQuery } from '../shared/env'

export function useImmerse<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [on, setOn] = useState(false)
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)')

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!canHover) {
      const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin: '-46% 0px -46% 0px' })
      io.observe(el)
      return () => io.disconnect()
    }
    let timer = 0
    let hovered = false
    let focused = false
    const settle = (delay: number) => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setOn(hovered || focused), delay)
    }
    const enter = () => ((hovered = true), settle(110))
    const leave = () => ((hovered = false), settle(180))
    const focusIn = (e: FocusEvent) => {
      // only keyboard focus counts; a click inside is already a hover
      if ((e.target as HTMLElement).matches?.(':focus-visible')) (focused = true), settle(0)
    }
    const focusOut = () => ((focused = false), settle(120))
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${Math.round(e.clientX - r.left)}px`)
      el.style.setProperty('--my', `${Math.round(e.clientY - r.top)}px`)
    }
    el.addEventListener('pointerenter', enter)
    el.addEventListener('pointerleave', leave)
    el.addEventListener('pointermove', move, { passive: true })
    el.addEventListener('focusin', focusIn)
    el.addEventListener('focusout', focusOut)
    return () => {
      window.clearTimeout(timer)
      el.removeEventListener('pointerenter', enter)
      el.removeEventListener('pointerleave', leave)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('focusin', focusIn)
      el.removeEventListener('focusout', focusOut)
    }
  }, [canHover])

  return { ref, on }
}
