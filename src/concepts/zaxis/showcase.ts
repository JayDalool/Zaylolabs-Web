/**
 * Optional per-product presentation data for Z-Axis product pages.
 *
 * `stepHeadings` gives the focus flight a headline per focus area (same order
 * as `product.focus`). They sequence the areas from the brief and add no new
 * claims. Products without an entry use the focus title itself.
 */
export const stepHeadings: Record<string, string[]> = {
  samvisionai: ['Start with the property.', 'Read the market around it.', 'Weigh the decision.', 'Hand over the report.'],
}
