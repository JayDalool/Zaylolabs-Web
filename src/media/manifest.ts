/**
 * Asset manifest — discovers real product captures at build time.
 *
 *   src/assets/products/<slug>/desktop/01-overview.png
 *   src/assets/products/<slug>/mobile/01-home.webp
 *   src/assets/products/<slug>/video/01-tour.mp4
 *
 * Files are ordered by name, so prefix them 01-, 02-, … to control which slot
 * each one fills. Any slot without a file falls back to a marked placeholder.
 */
import type { Surface } from '../data/products'

const files = import.meta.glob('/src/assets/products/*/*/*.{png,jpg,jpeg,webp,avif,mp4,webm}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

export type MediaKind = Surface | 'video'

const index: Record<string, Partial<Record<MediaKind, string[]>>> = {}
for (const path of Object.keys(files).sort()) {
  const [, slug, kind] = path.match(/products\/([^/]+)\/([^/]+)\//) ?? []
  if (!slug || !['desktop', 'mobile', 'video'].includes(kind)) continue
  ;((index[slug] ??= {})[kind as MediaKind] ??= []).push(files[path])
}

/** URL of the real capture in a slot (1-based), or undefined when none exists. */
export function realMedia(slug: string, kind: MediaKind, slot = 1): string | undefined {
  return index[slug]?.[kind]?.[slot - 1]
}

export function mediaCount(slug: string, kind: MediaKind): number {
  return index[slug]?.[kind]?.length ?? 0
}

export const hasRealMedia = (slug: string) =>
  (['desktop', 'mobile', 'video'] as MediaKind[]).some((k) => mediaCount(slug, k) > 0)
