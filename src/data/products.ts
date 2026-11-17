/**
 * ZayloLabs product catalogue — the single source of truth for the site.
 *
 * Content rules (from the brief):
 *  - Describe only what the product actually does. Every line here was checked
 *    against the app's own code and screens (research of 16–17 Nov 2026).
 *  - No invented customers, statistics, prices or availability.
 *
 * To add a product: append an entry here and drop captures into
 * src/assets/products/<slug>/{desktop,mobile}/ — nothing else is required.
 * A product with a light and a dark theme may also have desktop-light/ and
 * mobile-light/ folders; the viewer then offers a theme switch.
 */

export type Stage = 'live' | 'in-development'
export type Surface = 'desktop' | 'mobile'
export type Motif = 'parcel' | 'ledger' | 'weekgrid' | 'pipeline'
export type Theme = 'dark' | 'light'

export interface ProductHue {
  name: string
  /** The app's colour as it reads on the site's light paper (links, labels). */
  ink: string
  /** The app's light-emitting tone, used on its own deep field. */
  bright: string
  /** Pale tint — for washes on light grounds. */
  wash: string
  /** The colour a section becomes while the visitor is in it: the app's own ground. */
  field: string
  /** Text colour on that field. */
  on: string
}

export interface Product {
  slug: string
  /** Catalogue number used as a stable visual identifier. */
  catalog: string
  /** The name exactly as the app shows it. Change it here and it changes everywhere. */
  name: string
  discipline: string
  tagline: string
  summary: string
  stage: Stage
  stageLabel: string
  /** One honest line about who can use it today. */
  availability: string
  /** What it covers. The order matches the numbered screenshots (01-, 02-, …). */
  focus: { title: string; note: string }[]
  surfaces: Surface[]
  primarySurface: Surface
  /** Drives the placeholder schematic and the product glyph. */
  motif: Motif
  /** Colours taken from the app itself. */
  hue: ProductHue
  /** Themes the app really has. The first is the one its screenshots default to. */
  themes: Theme[]
  /** A smaller presence on the home page: a short mention, not a full-screen section. */
  compact?: boolean
  /** For a compact product: the caption of the one screenshot its page shows. */
  figure?: string
  /** A plain note shown wherever the product appears in detail. */
  note?: string
}

export const products: Product[] = [
  {
    slug: 'realtorlab',
    catalog: 'ZL-001',
    name: 'RealtorLab',
    discipline: 'Real-estate pricing',
    tagline: 'Comparable-sales pricing a REALTOR can defend.',
    summary:
      'Pricing tools for a licensed REALTOR in Winnipeg, built on sold data: a valuation with its range and confidence, a CMA, a CME with a seller’s net sheet, and offer guidance for a buyer.',
    stage: 'live',
    stageLabel: 'Live',
    availability: 'Running today. Access is by invitation.',
    focus: [
      { title: 'Valuation', note: 'An estimated value with its range and a confidence level, from comparable sales.' },
      { title: 'CMA', note: 'Comparable sold homes, adjusted line by line, and a suggested list price.' },
      { title: 'CME', note: 'Market statistics, sold listings and a seller’s net sheet for a listing appointment.' },
      { title: 'Offer', note: 'What it may take to win, and where the comparables say to stop.' },
      { title: 'Sold data', note: 'Sold data is imported and reviewed before any of it is used.' },
      { title: 'Client documents', note: 'A summary made for the client, as a PDF or by email.' },
    ],
    surfaces: ['desktop', 'mobile'],
    primarySurface: 'desktop',
    motif: 'parcel',
    // pine primary on warm paper — design/preline/src/theme.css
    hue: { name: 'Pine', ink: '#17553e', bright: '#9fd8bd', wash: '#e2f1e9', field: '#0f3f2d', on: '#f6f2ea' },
    themes: ['light', 'dark'],
    note: 'Decision support for a licensed REALTOR — not a formal appraisal.',
  },
  {
    slug: 'myexpenses',
    catalog: 'ZL-002',
    name: 'My Expenses',
    discipline: 'Household expenses',
    tagline: 'Snap receipts. Track spending. Stay in sync.',
    summary:
      'A private expense app for a household. Photograph a receipt and the date and total are read from it for you to check. The household shares one record, and at year end the accountant gets a package with every receipt.',
    stage: 'live',
    stageLabel: 'Live',
    availability: 'Running today. Access is by invitation.',
    focus: [
      { title: 'Add an expense', note: 'Photograph a receipt. The date and total are read from it for you to check.' },
      { title: 'Dashboard', note: 'This month’s spending, recent expenses, and who paid.' },
      { title: 'Receipts kept', note: 'Every expense keeps its receipt, ready to preview or download.' },
      { title: 'Reports', note: 'By period, category and member. Export as PDF, CSV, Excel, or a ZIP with every receipt.' },
      { title: 'Household', note: 'Members with roles, from owner to accountant, invited by a secure link.' },
    ],
    surfaces: ['mobile', 'desktop'],
    primarySurface: 'mobile',
    motif: 'ledger',
    // brand scale — tailwind.config.ts
    hue: { name: 'Sea green', ink: '#1f5d3a', bright: '#d8f3e5', wash: '#d8f3e5', field: '#267246', on: '#ffffff' },
    themes: ['light'],
  },
  {
    slug: 'commandcenter',
    catalog: 'ZL-003',
    name: 'Command Center',
    discipline: 'Engineering control room',
    tagline: 'AI agents do the engineering. The decisions that matter wait for a person.',
    summary:
      'The control room ZayloLabs builds with. It follows every task from plan to release, watches the agents, pull requests and checks, and stops wherever its rules say a person must decide.',
    stage: 'live',
    stageLabel: 'Live',
    availability: 'In use at ZayloLabs. Access is by invitation.',
    focus: [
      { title: 'My Office', note: 'What is happening across every project, from live data.' },
      { title: 'Engineering', note: 'Every open task by stage, and what is waiting at the release gate.' },
      { title: 'Decisions', note: 'Everything waiting for a person: questions, plans, merges and deploys.' },
      { title: 'Approval gates', note: 'Where the rules ask for a person, the work waits for one.' },
      { title: 'Teams', note: 'Which agent sessions are working, idle, or waiting for you.' },
      { title: 'Activity', note: 'A running record of what happened, and when.' },
    ],
    surfaces: ['desktop', 'mobile'],
    primarySurface: 'desktop',
    motif: 'pipeline',
    // Engineering HQ tokens — web/app/src/hq/tokens.css
    hue: { name: 'HQ orange', ink: '#b23a0a', bright: '#ff7a45', wash: '#fbe3d6', field: '#0f1012', on: '#ececee' },
    themes: ['dark', 'light'],
    note: 'Shown in Engineering HQ, the app’s newer interface, which is an opt-in preview inside it today.',
  },
  {
    slug: 'gyst',
    catalog: 'ZL-004',
    name: 'GYST',
    discipline: 'Personal life tracker',
    tagline: 'Plan. Track. Build. Grow.',
    summary:
      'A personal life tracker, from projects and work to health: tasks, projects broken into missions, training, nutrition, weight and water, and an AI health coach, kept in one place.',
    stage: 'live',
    stageLabel: 'Live',
    availability: 'Running today as a personal build. It is not open to others yet.',
    focus: [
      { title: 'Projects', note: 'Projects broken into missions, with progress you can see.' },
      { title: 'Tasks', note: 'What needs doing today, with repeats and reminders.' },
      { title: 'Health', note: 'Training, nutrition, weight and water in one view.' },
      { title: 'Health Coach', note: 'An AI coach that answers from your own food, training and weight record.' },
    ],
    surfaces: ['desktop', 'mobile'],
    primarySurface: 'desktop',
    motif: 'weekgrid',
    // shell tokens — web/static/css/ui-tokens.css
    hue: { name: 'GYST blue', ink: '#1d4ed8', bright: '#93c5fd', wash: '#dbe7fd', field: '#0f172a', on: '#f8fafc' },
    themes: ['light', 'dark'],
    compact: true,
    figure: 'The Galaxy: every project is a world, sized by its missions. Captured from the app with fictional projects.',
  },
]

export const productBySlug = (slug: string | undefined) => products.find((p) => p.slug === slug)
/** Products that get a full-screen section on the home page. */
export const featured = products.filter((p) => !p.compact)
export const compact = products.filter((p) => p.compact)

export const stages: { id: Stage; label: string; blurb: string }[] = [
  { id: 'live', label: 'Live', blurb: 'Running and in use. Access is by invitation, with plans to follow.' },
  { id: 'in-development', label: 'In development', blurb: 'Being built. Not available yet.' },
]

/**
 * Plans — what each Live app's Plans page says. No prices are invented here:
 * `tiers` stays empty until the owner supplies plan names and prices, and the
 * page shows clearly marked empty slots instead.
 * TODO(owner): plan names, prices, billing period and what each includes.
 * TODO(launch): attach hosted checkout (Stripe, PayPal) once the company is registered.
 */
export interface PlanTier {
  name: string
  price: string
  period: string
  includes: string[]
}
export const plans: Record<string, { tiers: PlanTier[] }> = {
  realtorlab: { tiers: [] },
  myexpenses: { tiers: [] },
  commandcenter: { tiers: [] },
  gyst: { tiers: [] },
}

/** What the studio does — wording taken from the company brief, nothing added. */
export const studio = {
  name: 'ZayloLabs',
  domain: 'zaylolabs.com',
  line: 'An independent software development studio.',
  practice: [
    { title: 'Applications', note: 'Software products designed and built in the studio.' },
    { title: 'AI-powered tools', note: 'Tools where a model does part of the work.' },
    { title: 'Business automation', note: 'Repetitive work turned into running systems.' },
    { title: 'Specialised solutions', note: 'Digital solutions for problems that don’t fit a template.' },
  ],
  /** TODO(owner): set the public contact address before launch. Never invented here. */
  contactEmail: null as string | null,
}
