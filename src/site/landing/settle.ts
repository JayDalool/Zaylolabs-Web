/**
 * Settle — when scrolling stops close to the start of a section, the page
 * finishes the move so the whole section is on screen.
 *
 * It only ever continues in the direction the visitor was already going and
 * only when the section start is near, so it cannot pull anyone back or trap
 * a mouse wheel (which the browser's own scroll snapping does). Off when
 * reduced motion is requested.
 */
import { useEffect } from 'react'

const HEADER = 64 // the sticky header
const NEAR = 0.3 // fraction of the screen height that counts as "close"

export function useSettle(selector = '.sp-snap') {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let last = window.scrollY
    let dir = 0
    let idle = 0
    let settling = false
    let release = 0

    const settle = () => {
      if (settling || !dir) return
      const y = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      const starts = [...document.querySelectorAll<HTMLElement>(selector)].map((el) => Math.round(el.getBoundingClientRect().top + y - HEADER))
      // the nearest section start ahead of the visitor, in the direction of travel
      const ahead = starts.filter((s) => (dir > 0 ? s > y + 2 : s < y - 2) && s <= max + 1)
      if (!ahead.length) return
      const target = dir > 0 ? Math.min(...ahead) : Math.max(...ahead)
      if (Math.abs(target - y) > window.innerHeight * NEAR) return
      settling = true
      window.scrollTo({ top: Math.max(0, target), behavior: 'smooth' })
      window.clearTimeout(release)
      release = window.setTimeout(() => {
        settling = false
        last = window.scrollY
        dir = 0
      }, 700)
    }
    const onScroll = () => {
      const y = window.scrollY
      if (!settling && y !== last) dir = y > last ? 1 : -1
      last = y
      window.clearTimeout(idle)
      idle = window.setTimeout(settle, 160)
    }
    // a new wheel, touch or key press always wins over a settle in progress
    const cancel = () => {
      settling = false
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('wheel', cancel, { passive: true })
    window.addEventListener('touchstart', cancel, { passive: true })
    window.addEventListener('keydown', cancel)
    return () => {
      window.clearTimeout(idle)
      window.clearTimeout(release)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('wheel', cancel)
      window.removeEventListener('touchstart', cancel)
      window.removeEventListener('keydown', cancel)
    }
  }, [selector])
}
