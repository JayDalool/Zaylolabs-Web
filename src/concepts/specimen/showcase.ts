/**
 * Per-product presentation data for Specimen pages: where annotation pins sit
 * on the primary capture and how the feature tour is sequenced.
 *
 * Pins are positioned for the current placeholder schematic. When a real
 * capture replaces it, move each pin onto the matching interface region.
 */
import type { Pin } from './exploded/layers'

/** One pin per `focus` entry, in the same order. x/y are 0–1 from top-left. */
export const pins: Record<string, Pin[]> = {
  samvisionai: [
    { x: 0.545, y: 0.5 },
    { x: 0.31, y: 0.36 },
    { x: 0.775, y: 0.2 },
    { x: 0.683, y: 0.645 },
  ],
}

export interface TourStep {
  /** Index into product.focus. */
  focus: number
  heading: string
  /** Capture slot shown for this step: src/assets/products/<slug>/<surface>/0N-*. */
  slot: number
  slotLabel: string
}

/** Workflow tours. Headings sequence the brief's focus areas; they add no new claims. */
export const tours: Record<string, TourStep[]> = {
  samvisionai: [
    { focus: 0, heading: 'Start with the property.', slot: 1, slotLabel: 'Property analysis' },
    { focus: 1, heading: 'Read the market around it.', slot: 2, slotLabel: 'Comparative market analysis' },
    { focus: 2, heading: 'Weigh the decision.', slot: 3, slotLabel: 'Decision support' },
    { focus: 3, heading: 'Hand over the report.', slot: 4, slotLabel: 'Client report' },
  ],
}

/** Section title for each tour, split as [roman, italic]. */
export const tourTitles: Record<string, [string, string]> = {
  samvisionai: ['From a property', 'to a report.'],
}

export const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
