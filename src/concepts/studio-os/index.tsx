import { useIsNarrow } from '../../shared/env'
import Desktop from './Desktop'
import Mobile from './Mobile'
import './sos.css'

/**
 * Concept 03 — Studio OS.
 * The website is the studio's desktop: windows, a dock, a menubar and a command
 * palette. Phones get a home-screen shell with the same per-product content.
 */
export default function StudioOS() {
  const narrow = useIsNarrow(768)
  return narrow ? <Mobile /> : <Desktop />
}
