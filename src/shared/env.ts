import { useEffect, useState, useSyncExternalStore } from 'react'

/** Subscribes to a media query. Server/first render uses the query's current value. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query)
      m.addEventListener('change', cb)
      return () => m.removeEventListener('change', cb)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')
export const useIsCoarsePointer = () => useMediaQuery('(pointer: coarse)')
export const useIsNarrow = (px = 768) => useMediaQuery(`(max-width: ${px - 0.02}px)`)

let webglCache: boolean | undefined
/** True when a WebGL context can actually be created. `?nowebgl` forces the fallback for testing. */
export function detectWebGL(): boolean {
  if (webglCache !== undefined) return webglCache
  if (typeof window === 'undefined') return false
  if (/[?&]nowebgl\b/.test(window.location.href)) return (webglCache = false)
  try {
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl2') ?? c.getContext('webgl')
    webglCache = !!gl
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    webglCache = false
  }
  return webglCache
}

/**
 * Whether a heavy WebGL scene should mount at all. False until after hydration,
 * and false when WebGL is unavailable — callers render their static fallback.
 */
export function useWebGL(): boolean {
  const [ok, setOk] = useState(false)
  useEffect(() => setOk(detectWebGL()), [])
  return ok
}

/** Device-pixel-ratio cap: full quality on desktop, cheaper on phones. */
export function dprRange(narrow: boolean): [number, number] {
  return narrow ? [1, 1.5] : [1, 2]
}
