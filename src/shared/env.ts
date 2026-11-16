import { useSyncExternalStore } from 'react'

/** Subscribes to a media query. */
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

export const useIsCoarsePointer = () => useMediaQuery('(pointer: coarse)')
