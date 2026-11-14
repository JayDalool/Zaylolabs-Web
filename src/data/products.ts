/**
 * ZayloLabs product catalogue — the single source of truth for every concept.
 *
 * Content rules (from the brief):
 *  - Describe only what the product actually is. No invented capabilities,
 *    customers, statistics or availability.
 *  - `stage` must reflect reality. Anything not confirmed is marked TODO(owner).
 *
 * To add a product: append an entry here and drop captures into
 * src/assets/products/<slug>/{desktop,mobile,video}/ — nothing else is required.
 */

export type Stage = 'in-development' | 'internal' | 'prototype'
export type Surface = 'desktop' | 'mobile'
export type Motif = 'parcel' | 'ledger' | 'weekgrid' | 'pipeline' | 'dose'

export interface ProductHue {
  name: string
  /** Deep tone — legible on light paper. */
  ink: string
  /** Luminous tone — for dark scenes and light emission. */
  bright: string
  /** Pale tint — for washes on light grounds. */
  wash: string
}

export interface Product {
  slug: string
  /** Catalogue number used as a stable visual identifier. */
  catalog: string
  name: string
  alias?: string
  discipline: string
  tagline: string
  summary: string
  stage: Stage
  stageLabel: string
  /** One honest line about who can use it today. */
  availability: string
  focus: { title: string; note: string }[]
  surfaces: Surface[]
  primarySurface: Surface
  /** Drives the placeholder schematic and the product glyph. */
  motif: Motif
  hue: ProductHue
  /** Extra caution shown wherever the product appears in detail. */
  caution?: string
}

export const products: Product[] = [
  {
    slug: 'samvisionai',
    catalog: 'ZL-001',
    name: 'SamVisionAI',
    discipline: 'Real-estate intelligence',
    tagline: 'Property analysis that ends in a decision.',
    summary:
      'Real-estate intelligence for property analysis, comparative market analysis, decision support and client reports.',
    // TODO(owner): confirm stage + availability wording.
    stage: 'in-development',
    stageLabel: 'In development',
    availability: 'Not publicly available yet.',
    focus: [
      { title: 'Property analysis', note: 'A structured look at a single property.' },
      { title: 'Comparative market analysis', note: 'Comparable properties, read side by side.' },
      { title: 'Decision support', note: 'Analysis organised around the decision in front of you.' },
      { title: 'Client reports', note: 'Findings assembled into reports made for clients.' },
    ],
    surfaces: ['desktop', 'mobile'],
    primarySurface: 'desktop',
    motif: 'parcel',
    hue: { name: 'Survey ochre', ink: '#8f5407', bright: '#f5a93a', wash: '#f3dfb8' },
  },
  {
    slug: 'myfamilyexpenses',
    catalog: 'ZL-002',
    name: 'MyFamilyExpenses',
    discipline: 'Family finance',
    tagline: 'One household, one shared picture of its money.',
    summary:
      'Family financial management: shared household expenses, receipt management and financial reporting.',
    // TODO(owner): confirm stage + availability wording.
    stage: 'in-development',
    stageLabel: 'In development',
    availability: 'Not publicly available yet.',
    focus: [
      { title: 'Shared household expenses', note: 'Spending recorded by the household, for the household.' },
      { title: 'Receipt management', note: 'Receipts kept with the expenses they belong to.' },
      { title: 'Financial reporting', note: 'Reports that show where the money went.' },
    ],
    surfaces: ['mobile', 'desktop'],
    primarySurface: 'mobile',
    motif: 'ledger',
    hue: { name: 'Ledger green', ink: '#1b6e46', bright: '#4fd896', wash: '#cfe8d6' },
  },
  {
    slug: 'gyst',
    catalog: 'ZL-003',
    name: 'GYST',
    alias: 'LifeOps',
    discipline: 'Life management',
    tagline: 'Planning, tasks and routines in one system.',
    summary:
      'A personal productivity and life-management system combining planning, tasks, routines and connected data.',
    // TODO(owner): confirm stage + availability wording.
    stage: 'in-development',
    stageLabel: 'In development',
    availability: 'Not publicly available yet.',
    focus: [
      { title: 'Planning', note: 'A plan you can see the whole of.' },
      { title: 'Tasks', note: 'What needs doing, in one place.' },
      { title: 'Routines', note: 'The recurring things, given a rhythm.' },
      { title: 'Connected data', note: 'The pieces linked rather than scattered.' },
    ],
    surfaces: ['desktop', 'mobile'],
    primarySurface: 'desktop',
    motif: 'weekgrid',
    hue: { name: 'Routine cobalt', ink: '#2742c9', bright: '#7c97ff', wash: '#d3daf6' },
  },
  {
    slug: 'commandcenter',
    catalog: 'ZL-004',
    name: 'CommandCenter',
    discipline: 'Development orchestration',
    tagline: 'The control surface behind the studio.',
    summary:
      'An internal development orchestration platform for AI agents, engineering workflows, project management, approvals and CI operations.',
    stage: 'internal',
    stageLabel: 'Internal',
    availability: 'Internal platform. Not offered as a product.',
    focus: [
      { title: 'AI agents', note: 'Orchestration for agents doing engineering work.' },
      { title: 'Engineering workflows', note: 'The path a change takes, made explicit.' },
      { title: 'Project management', note: 'Work tracked where the work happens.' },
      { title: 'Approvals', note: 'Sign-off as a step in the flow.' },
      { title: 'CI operations', note: 'Continuous integration, operated from one surface.' },
    ],
    surfaces: ['desktop'],
    primarySurface: 'desktop',
    motif: 'pipeline',
    hue: { name: 'Signal graphite', ink: '#2c2f36', bright: '#d8ff45', wash: '#dcdcd6' },
    caution: 'Internal operational details are intentionally not shown.',
  },
  {
    slug: 'gauzemate',
    catalog: 'ZL-005',
    name: 'GauzeMate',
    discipline: 'Healthcare prototype',
    tagline: 'Medication information and reminders, explored.',
    summary: 'A healthcare-oriented software prototype involving medication information and reminders.',
    stage: 'prototype',
    stageLabel: 'Prototype',
    availability: 'Experimental prototype. Not released.',
    focus: [
      { title: 'Medication information', note: 'Information about medication, presented clearly.' },
      { title: 'Reminders', note: 'Prompts at the moment they matter.' },
    ],
    surfaces: ['mobile'],
    primarySurface: 'mobile',
    motif: 'dose',
    hue: { name: 'Clinical teal', ink: '#086c69', bright: '#63e2d8', wash: '#c9e6e2' },
    caution: 'An early prototype — not a released product and not a source of medical advice.',
  },
]

export const productBySlug = (slug: string | undefined) => products.find((p) => p.slug === slug)

export const stages: { id: Stage; label: string; blurb: string }[] = [
  { id: 'in-development', label: 'In development', blurb: 'Being built. Not publicly available.' },
  { id: 'internal', label: 'Internal', blurb: 'Used inside the studio. Not offered externally.' },
  { id: 'prototype', label: 'Prototype', blurb: 'Experimental. Not released.' },
]

/** What the studio does — wording taken from the company brief, nothing added. */
export const studio = {
  name: 'ZayloLabs',
  domain: 'zaylolabs.com',
  line: 'An independent software development studio.',
  about:
    'ZayloLabs builds applications, AI-powered tools, business automation and specialised digital solutions — starting with its own products.',
  practice: [
    { title: 'Applications', note: 'Software products designed and built in the studio.' },
    { title: 'AI-powered tools', note: 'Tools where a model does part of the work.' },
    { title: 'Business automation', note: 'Repetitive work turned into running systems.' },
    { title: 'Specialised solutions', note: 'Digital solutions for problems that don’t fit a template.' },
  ],
  /** TODO(owner): set the public contact address before launch. Never invented here. */
  contactEmail: null as string | null,
}
