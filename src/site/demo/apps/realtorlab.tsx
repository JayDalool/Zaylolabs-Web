/* eslint-disable react/jsx-key -- table cells are keyed by the kit */
/**
 * RealtorLab — redrawn from the app's own templates (valuation_new.html,
 * valuation_result.html, cma_worksheet.html, cme_report.html, _offer_panel.html,
 * imports_new.html, _review.html, valuation_summary.html).
 * All people, addresses, listing numbers and prices are made up.
 */
import type { ReactNode } from 'react'
import { Banner, Btn, Card, Cols, Field, Figure, Files, Kpis, Ledger, Meter, Note, Pill, Progress, Shell, Table, Tabs, Tiles, Toast, Toggle, type Go } from '../kit'
import type { Demo } from '../types'

const NAV = ['#Work', 'Overview', 'Pricing', 'Saved work', '#Market', 'Analytics', 'Sold data', '#Tools', 'Rental', 'Mileage', 'Advisor']
const TOOLS = ['Valuation', 'CMA', 'CME', 'Offer']
const SUBJECT = '12 Example Street'

function RL({ on = 'Pricing', title, tag, tool, actions, children }: { on?: string; title: string; tag: string; tool?: number; actions?: ReactNode; children: ReactNode }) {
  return (
    <Shell brand="RealtorLab" sub="Winnipeg" nav={NAV} on={on} title={title} tag={tag} actions={actions} tabs={tool === undefined ? undefined : <Tabs items={TOOLS} on={tool} />}>
      {children}
    </Shell>
  )
}
const badge = (word: string, tone: 'ok' | 'warn' | 'bad' = 'ok') => (
  <span className="dm-pill" data-tone={tone} data-badge="" data-dot={undefined}>
    ● {word}
  </span>
)
const DISCLAIMER = 'Decision support for a licensed REALTOR — not a formal appraisal. Not for financing, taxation or litigation.'

const subjectFields = (
  <Cols>
    <Field label="Neighbourhood" value="Larkfield" />
    <Field label="Property type" value="Single family" />
    <Field label="Living area" value="1,240 sq ft" />
    <Field label="Bedrooms" value="3" />
    <Field label="Full baths" value="2" />
  </Cols>
)

const comparables = (go?: Go) => (
  <Card title="Comparable sales · 8 of 9 included">
    <Table
      head={['Use', 'MLS', 'Neighbourhood', 'Sold', 'Price', '$/sq ft', 'Similarity']}
      num={[4, 5]}
      wide={[1, 2, 5]}
      dim={[3]}
      rows={[
        [<Toggle on />, '209914821', 'Larkfield', '14 Jun 2026', '$418,500', '$334.80', <Meter value={91} />],
        [<Toggle on />, '209913377', 'Larkfield', '02 May 2026', '$405,900', '$329.19', <Meter value={88} />],
        [<Toggle on />, '209915560', 'Larkfield', '21 Jul 2026', '$412,000', '$331.45', <Meter value={84} />],
        [<Toggle />, '209912204', 'Aspen Hollow', '11 Apr 2026', '$447,000', '$352.60', <Meter value={68} tone="warn" />],
      ]}
    />
    {go && (
      <div className="dm-line" style={{ marginTop: '0.5rem' }}>
        <span className="dm-dim">1 comparable excluded by hand.</span>
        <Btn go={go} small>
          Client summary
        </Btn>
      </div>
    )}
  </Card>
)

export const realtorlab: Demo[] = [
  {
    id: 'price-a-property',
    label: 'Price a property',
    summary: 'One property, from its description to a summary the client can keep.',
    device: 'window',
    steps: [
      {
        title: 'Describe the property',
        note: 'The address only names the valuation. The search uses where the home is and what it is.',
        scene: (go) => (
          <RL title="New valuation" tag="Comparable sales" tool={0}>
            <Field label="Property address" value={SUBJECT} type hint="Names this valuation and anything made from it. Not used to find comparables." />
            {subjectFields}
            <div className="dm-line">
              <Btn go={go}>Run valuation</Btn>
              <span className="dm-eyebrow">Saved as soon as it runs</span>
            </div>
          </RL>
        ),
      },
      {
        title: 'Comparable sales are scored',
        note: 'The search starts in the neighbourhood and widens to the area only if it must.',
        auto: 2600,
        scene: () => (
          <RL title="New valuation" tag="Comparable sales" tool={0}>
            <Card>
              <Progress label="Scoring comparable sales against the subject…" />
            </Card>
            <Kpis
              items={[
                ['Comparables', '—'],
                ['Median similarity', '—'],
                ['Price spread', '—'],
              ]}
            />
          </RL>
        ),
      },
      {
        title: 'The answer comes with its range',
        note: 'One figure, the range under it, and how much confidence the evidence supports.',
        scene: (go) => (
          <RL title={SUBJECT} tag="Valuation" tool={0}>
            <Card>
              <Figure label="Estimated value" value="$412,000" sub="RANGE $396,000 – $428,000" side={badge('High confidence')} />
            </Card>
            <Kpis
              items={[
                ['Comparables', '8'],
                ['Median similarity', '86'],
                ['Price spread', '7%'],
                ['Median $/sq ft', '$331.45'],
                ['Direct median', '$410,500'],
                ['Search', 'Local', 'ok'],
              ]}
            />
            <div className="dm-line">
              <span className="dm-dim">{DISCLAIMER}</span>
              <Btn go={go} small>
                Comparable sales
              </Btn>
            </div>
          </RL>
        ),
      },
      {
        title: 'Every comparable is on the table',
        note: 'Each sale shows how similar it is. A sale that does not belong can be switched off, and that is recorded.',
        scene: (go) => (
          <RL title={SUBJECT} tag="Valuation" tool={0}>
            {comparables(go)}
          </RL>
        ),
      },
      {
        title: 'A summary made for the client',
        note: 'The client’s copy masks listing numbers and carries the disclaimer.',
        scene: (go) => (
          <RL title={SUBJECT} tag="Client summary" tool={0}>
            <div className="dm-sheet">
              <p className="dm-eyebrow">Comparable sales summary</p>
              <h4>{SUBJECT}</h4>
              <Figure label="Estimated value" value="$412,000" sub="RANGE $396,000 – $428,000" side={badge('High confidence')} />
              <Banner tone="warn" title="This is decision support for a licensed REALTOR, not a formal appraisal." />
            </div>
            <Cols>
              <Field label="Send to client" value="client@example.com" type />
              <Btn go={go}>Send with PDF</Btn>
            </Cols>
          </RL>
        ),
      },
      {
        title: 'Sent, with the PDF attached',
        note: 'The same summary can be printed or downloaded instead.',
        scene: () => (
          <RL title={SUBJECT} tag="Client summary" tool={0}>
            <Toast>Sent to client@example.com, PDF attached. Replies come to you.</Toast>
            <div className="dm-sheet">
              <p className="dm-eyebrow">Comparable sales summary</p>
              <h4>{SUBJECT}</h4>
              <Table
                head={['MLS', 'Sold', 'Price', '$/sq ft']}
                num={[2, 3]}
                rows={[
                  ['•••4821', '14 Jun 2026', '$418,500', '$334.80'],
                  ['•••3377', '02 May 2026', '$405,900', '$329.19'],
                  ['•••5560', '21 Jul 2026', '$412,000', '$331.45'],
                ]}
              />
            </div>
          </RL>
        ),
      },
    ],
  },
  {
    id: 'cma',
    label: 'CMA',
    summary: 'For a seller: comparable sold homes, adjusted, and a suggested list price.',
    device: 'window',
    steps: [
      {
        title: 'Open a CMA for the property',
        note: 'A CMA needs the style and the year built as well.',
        scene: (go) => (
          <RL title="Comparative market analysis" tag="Sold listings only" tool={1}>
            <Note>For a seller: comparable sold homes adjusted for bedrooms, baths, basement and garage, and a suggested list price.</Note>
            <Field label="Property address" value={SUBJECT} />
            <Cols>
              <Field label="Style" value="Bungalow" type />
              <Field label="Year built" value="1986" type delay={500} />
            </Cols>
            <Btn go={go}>Value and open CMA</Btn>
          </RL>
        ),
      },
      {
        title: 'Check the sales that count',
        note: 'The worksheet is yours to correct. Set aside a sale that does not belong.',
        scene: (go) => (
          <RL title={SUBJECT} tag="CMA worksheet" tool={1}>
            <Card>
              <Figure label="As it stands" value="$414,900" side={<Pill tone="info">8 counted</Pill>} />
            </Card>
            <Card title="Counted · Comparables">
              <Table
                head={['MLS', 'Sold', 'Asked', 'Sold price', 'Adjusted', '']}
                num={[2, 3, 4]}
                wide={[1, 2]}
                rows={[
                  ['209914821', '14 Jun 2026', '$409,900', '$418,500', '$412,500', ''],
                  ['209913377', '02 May 2026', '$399,900', '$401,000', '$410,000', ''],
                  [
                    '209912204',
                    '11 Apr 2026',
                    '$439,900',
                    '$447,000',
                    '$441,000',
                    <Btn go={go} small ghost>
                      Set aside
                    </Btn>,
                  ],
                ]}
              />
            </Card>
          </RL>
        ),
      },
      {
        title: 'The figure follows your judgement',
        note: 'The sale you set aside stays on the record, with your reason.',
        scene: (go) => (
          <RL title={SUBJECT} tag="CMA worksheet" tool={1}>
            <Card>
              <Figure label="As it stands" value="$409,900" side={<Pill tone="info">7 counted</Pill>} />
            </Card>
            <Card title="Not counted · Set aside">
              <div className="dm-line">
                <span>
                  <span className="dm-key">209912204</span> · Why: larger lot, backs onto a park
                </span>
                <Btn small ghost>
                  Put it back
                </Btn>
              </div>
            </Card>
            <div className="dm-line">
              <span className="dm-dim">When the sales are right, open the client’s copy.</span>
              <Btn go={go}>Open the client report</Btn>
            </div>
          </RL>
        ),
      },
      {
        title: 'The client report',
        note: 'A suggested list price, the range, and each adjustment line by line.',
        scene: () => (
          <RL title={SUBJECT} tag="Client report" tool={1}>
            <div className="dm-sheet">
              <p className="dm-eyebrow">Comparative market analysis</p>
              <Figure label="Suggested list price" value="$409,900" sub="RANGE $399,000 – $419,000" />
              <Table
                head={['MLS', 'Price used', 'Bedrooms', 'Basement', 'Garage', 'Adjusted price']}
                num={[1, 2, 3, 4, 5]}
                wide={[2, 4]}
                rows={[
                  ['•••4821', '$418,500', '$0', '−$6,000', '$0', '$412,500'],
                  ['•••3377', '$401,000', '+$5,000', '$0', '+$4,000', '$410,000'],
                  ['•••5560', '$405,900', '$0', '+$3,000', '$0', '$408,900'],
                ]}
              />
              <p className="dm-dim">Built from sold listings only. Active and expired listings are not included.</p>
            </div>
          </RL>
        ),
      },
    ],
  },
  {
    id: 'cme',
    label: 'CME and net sheet',
    summary: 'For a listing appointment: the market, the sold listings, and what the seller walks away with.',
    device: 'window',
    steps: [
      {
        title: 'Add the seller’s figures',
        note: 'The net sheet is optional. Leave it blank and the CME prints without it.',
        scene: (go) => (
          <RL title="Current market evaluation" tag="Sold listings only" tool={2}>
            <Field label="Property address" value={SUBJECT} />
            <p className="dm-eyebrow">Seller’s net sheet · Optional · Saved with the CME</p>
            <Cols>
              <Field label="Sale price" value="410,000" type />
              <Field label="Commission, %" value="4.5" type delay={400} />
              <Field label="Legal fees" value="1,200" type delay={800} />
              <Field label="Mortgage payout" value="186,000" type delay={1200} />
            </Cols>
            <Btn go={go}>Create CME</Btn>
          </RL>
        ),
      },
      {
        title: 'The market, in three figures',
        note: 'Area statistics come first, then the suggested list price.',
        scene: (go) => (
          <RL title={SUBJECT} tag="Current market evaluation" tool={2}>
            <Kpis
              items={[
                ['Sold in the last 90 days', '23'],
                ['Average days on market', '18'],
                ['Sold over asking', '9 of 23'],
              ]}
            />
            <Card>
              <Figure label="Suggested list price" value="$409,900" sub="RANGE $399,000 – $419,000" />
            </Card>
            <Btn go={go} small>
              Seller’s net sheet
            </Btn>
          </RL>
        ),
      },
      {
        title: 'What the seller walks away with',
        note: 'Each deduction is listed. The total is an estimate and says so.',
        scene: () => (
          <RL title={SUBJECT} tag="Current market evaluation" tool={2}>
            <Card title="Seller’s net sheet">
              <Ledger
                rows={[
                  ['Sale price', '$410,000.00'],
                  ['Realtor commission (4.5%)', '−$18,450.00'],
                  ['GST on commission (5%)', '−$922.50'],
                  ['Legal fees', '−$1,200.00'],
                  ['Property tax adjustment', '−$640.00'],
                  ['Mortgage payout', '−$186,000.00'],
                  ['Mortgage penalty', '−$1,850.00'],
                ]}
                total={['Seller’s net', '$200,937.50']}
              />
            </Card>
            <p className="dm-dim">This is an estimate. Actual costs will vary and are not guaranteed.</p>
          </RL>
        ),
      },
    ],
  },
  {
    id: 'offer',
    label: 'Offer',
    summary: 'For a buyer facing other offers: what it may take to win, and when to stop.',
    device: 'window',
    steps: [
      {
        title: 'Enter the asking price',
        note: 'The Offer tool starts from a valued property and what it is listed at.',
        scene: (go) => (
          <RL title={SUBJECT} tag="What to offer" tool={3}>
            <Note>For a buyer facing multiple offers: what it may take to win, and when that is more than the comparable sales support.</Note>
            <Card title={`${SUBJECT} · Going to multiple offers`}>
              <Cols>
                <Field label="Asking price" value="399,900" type />
                <Btn go={go}>Work it out</Btn>
              </Cols>
            </Card>
          </RL>
        ),
      },
      {
        title: 'What it takes to win',
        note: 'Three levels, stated as predictions. The caveat comes first.',
        scene: (go) => (
          <RL title={SUBJECT} tag="What to offer" tool={3}>
            <Banner tone="warn" title="Offer figures are soft predictions, not a valuation." />
            <Card title="What it takes to win · Asking price $399,900">
              <Tiles
                items={[
                  ['$421,000', '1 Typical winning price', 'bad'],
                  ['$429,500', '2 Competitive'],
                  ['$441,000', '3 Top of the competition', 'warn'],
                ]}
              />
            </Card>
            <Btn go={go} small>
              Walk-away check
            </Btn>
          </RL>
        ),
      },
      {
        title: 'And where to stop',
        note: 'The comparable sales set a ceiling. The verdict is given in plain words.',
        scene: () => (
          <RL title={SUBJECT} tag="What to offer" tool={3}>
            <Banner tone="info" title="Compete up to the ceiling, and stop there." />
            <Card title="Walk-away check">
              <Ledger rows={[['Asking price', '$399,900']]} total={['Most the comparables support', '$428,000']} />
              <p className="dm-dim" style={{ margin: '0.3rem 0 0' }}>
                A ceiling, not a valuation.
              </p>
            </Card>
          </RL>
        ),
      },
    ],
  },
  {
    id: 'sold-data',
    label: 'Import sold data',
    summary: 'Sold data comes in through a review step. Nothing is used until you add it.',
    device: 'window',
    steps: [
      {
        title: 'Choose the two exports',
        note: 'Two reports covering the same sales. They are matched on the listing number.',
        scene: (go) => (
          <RL on="Sold data" title="Import sold data" tag="Two exports">
            <Files
              files={[
                ['agent-single-line.pdf', 'Agent Single Line incl SP · 1.2 MB'],
                ['client-full.pdf', 'Client Full · 8.4 MB'],
              ]}
              pick={0}
              go={go}
              title="Choose the two reports"
            />
            <p className="dm-dim">PDF · up to 64 MB each. Your data stays in your account.</p>
          </RL>
        ),
      },
      {
        title: 'Start the import',
        note: 'One report carries the verified sell date, the other the property detail.',
        scene: (go) => (
          <RL on="Sold data" title="Import sold data" tag="Two exports">
            <Cols>
              <Card title="Agent Single Line incl SP">
                <span className="dm-key">agent-single-line.pdf</span>
                <p className="dm-dim" style={{ margin: 0 }}>
                  Carries the verified sell date.
                </p>
              </Card>
              <Card title="Client Full">
                <span className="dm-key">client-full.pdf</span>
                <p className="dm-dim" style={{ margin: 0 }}>
                  Carries the property detail.
                </p>
              </Card>
            </Cols>
            <div className="dm-line">
              <Btn go={go}>Start import</Btn>
              <Btn ghost>Cancel</Btn>
            </div>
          </RL>
        ),
      },
      {
        title: 'The exports are read',
        note: 'You can close the page. The import keeps running.',
        auto: 2800,
        scene: () => (
          <RL on="Sold data" title="Import" tag="Started 16 Nov 2026 · 09:41">
            <Card title="Import in progress">
              <Progress label="Reading your exports. This usually takes a few minutes." />
            </Card>
            <p className="dm-dim">You can close this page. The import keeps running, and it will be waiting here when you come back.</p>
          </RL>
        ),
      },
      {
        title: 'Review before anything is added',
        note: 'The count on the button is exactly what will be added.',
        scene: (go) => (
          <RL on="Sold data" title="Import" tag="Awaiting review">
            <Banner tone="warn" title="214 of 221 sales can be added." />
            <Card title="Review import · 02 Sep 2026 – 14 Nov 2026">
              <Ledger
                rows={[
                  ['Agent Single Line incl SP', '221'],
                  ['Client Full', '221'],
                  ['Accepted', '214'],
                  ['Rejected', '7'],
                  ['Warnings', '3'],
                ]}
                total={['Ready to add', '214']}
              />
            </Card>
            <div className="dm-line">
              <Btn go={go}>Add 214 sales to my data</Btn>
              <Btn ghost>Discard import</Btn>
            </div>
          </RL>
        ),
      },
      {
        title: 'Added, and ready to use',
        note: 'Only now are these sales available to a valuation.',
        scene: () => (
          <RL on="Sold data" title="Sold data" tag="3 imports">
            <Toast>214 sales added. They are available in valuations now.</Toast>
            <Kpis
              items={[
                ['Sales in your data', '1,714'],
                ['Sold dates covered', '03 Jan 2025 – 14 Nov 2026'],
                ['Last import', '16 Nov 2026'],
              ]}
            />
            <Table
              head={['Started', 'Status', 'Read', 'Added']}
              num={[2, 3]}
              rows={[
                ['16 Nov 2026', <Pill tone="ok">Added</Pill>, '221', '214'],
                ['02 Sep 2026', <Pill tone="ok">Added</Pill>, '760', '752'],
              ]}
            />
          </RL>
        ),
      },
    ],
  },
]
