/* eslint-disable react/jsx-key -- table cells are keyed by the kit */
/**
 * My Expenses — redrawn from the app's own screens (app/dashboard,
 * components/expense-wizard.tsx, app/expenses, app/reports, app/household).
 * The household, people, shops and amounts are made up.
 */
import type { ReactNode } from 'react'
import { Banner, Bars, Btn, Card, Cols, Field, Files, Head, Kv, Note, Pill, Progress, Receipt, Row, Shell, Stepper, Tiles, type Go } from '../kit'
import type { Demo } from '../types'

const TABS = ['Home', 'Expenses', 'Reports', 'Categories', 'Household']
const HOUSE = 'The Carter household'
const WIZARD = ['Category', 'Receipt', 'Review']

function ME({ on, hot, go, children }: { on: string; hot?: string; go?: Go; children: ReactNode }) {
  return (
    <Shell phone brand="My Expenses" sub={HOUSE} nav={TABS} on={on} hot={hot} go={go}>
      {children}
    </Shell>
  )
}

const cats = (go: Go) => (
  <div className="dm-cats">
    {['Restaurant', 'Travel', 'Education', 'Groceries', 'Utilities', 'Medical'].map((c) =>
      c === 'Groceries' ? (
        <button key={c} type="button" className="dm-cat dm-hot" onClick={go}>
          <i aria-hidden="true" />
          {c}
        </button>
      ) : (
        <div key={c} className="dm-cat">
          <i aria-hidden="true" />
          {c}
        </div>
      ),
    )}
  </div>
)

const zip = (
  <Card title="myfamilyexpenses-the-carter-household-this-year.zip">
    <Kv k="README.txt" v="what is inside" />
    <Kv k="summary.pdf" v="the report" />
    <Kv k="index.csv · index.xlsx" v="every expense" />
    <Kv k="receipts/" v="168 files" />
    <p className="dm-dim" style={{ margin: '0.3rem 0 0' }}>
      receipts/2026-03-14_northgate-fresh-market_20.97.jpg
    </p>
  </Card>
)

export const myexpenses: Demo[] = [
  {
    id: 'receipt-to-year-end',
    label: 'A receipt, start to finish',
    summary: 'One receipt, from the photo to the package the accountant gets at year end.',
    device: 'phone',
    steps: [
      {
        title: 'Start from the dashboard',
        note: 'The household keeps one record. Anyone in it can add to it.',
        scene: (go) => (
          <ME on="Home">
            <Head sub={`${HOUSE} · March 2026`}>Hi, Maya</Head>
            <Tiles
              items={[
                ['$612.40', 'This month'],
                ['14', 'Expenses'],
                ['$43.74', 'Average expense'],
              ]}
            />
            <Card title="Recent expenses">
              <Kv k="Groceries · Daniel" v="$58.13" />
              <Kv k="Utilities · Maya" v="$80.62" />
            </Card>
            <Btn go={go} wide>
              Add expense
            </Btn>
          </ME>
        ),
      },
      {
        title: 'Choose a category',
        note: 'The category comes first, before the receipt.',
        scene: (go) => (
          <ME on="Expenses">
            <Stepper items={WIZARD} at={0} />
            <Head sub="Choose what this expense is for before you scan or upload a receipt.">Select a category</Head>
            {cats(go)}
          </ME>
        ),
      },
      {
        title: 'Photograph or upload the receipt',
        note: 'Use the camera, or choose a file you already have.',
        scene: (go) => (
          <ME on="Expenses">
            <Stepper items={WIZARD} at={1} />
            <Head sub="Category: Groceries">Upload your receipt</Head>
            <Btn ghost wide>
              Take a photo
            </Btn>
            <Btn go={go} wide>
              Choose from files
            </Btn>
            <Note>A photo, an image or a PDF.</Note>
          </ME>
        ),
      },
      {
        title: 'Pick the photo',
        note: 'This is a sample file chooser inside the demo. Nothing is uploaded.',
        scene: (go) => (
          <ME on="Expenses">
            <Stepper items={WIZARD} at={1} />
            <Files
              files={[
                ['IMG_2041.jpg', '2.4 MB'],
                ['receipt.jpg', '1.8 MB'],
                ['hydro-bill.pdf', '220 KB'],
              ]}
              pick={1}
              go={go}
            />
          </ME>
        ),
      },
      {
        title: 'The receipt is read',
        note: 'The app reads the receipt itself, on its own server. No outside service sees it.',
        auto: 2600,
        scene: () => (
          <ME on="Expenses">
            <Stepper items={WIZARD} at={1} />
            <Receipt />
            <Progress label="Reading receipt..." />
          </ME>
        ),
      },
      {
        title: 'Read successfully',
        note: 'What was read is shown on the next step, for you to check.',
        scene: (go) => (
          <ME on="Expenses">
            <Stepper items={WIZARD} at={1} />
            <Receipt />
            <Banner tone="ok" title="Receipt read successfully">
              — review the details on the next step.
            </Banner>
            <Btn go={go} wide>
              Next
            </Btn>
          </ME>
        ),
      },
      {
        title: 'Check what was read',
        note: 'The date and total were filled in for you. The shop and payment method are typed by hand.',
        scene: (go) => (
          <ME on="Expenses">
            <Stepper items={WIZARD} at={2} />
            <Banner tone="ok" title="Date and amount detected">
              Review the values below, then save.
            </Banner>
            <Cols>
              <Field label="Invoice date" value="2026-03-14" chip="✓ Auto-filled" tone="ok" />
              <Field label="Total paid (tax included)" value="20.97" chip="✓ Auto-filled" tone="ok" />
            </Cols>
            <Field label="Vendor" value="Northgate Fresh Market" type />
            <Btn go={go} wide>
              Save expense
            </Btn>
          </ME>
        ),
      },
      {
        title: 'Saved, with its receipt',
        note: 'At year end, open Reports.',
        scene: (go) => (
          <ME on="Expenses" hot="Reports" go={go}>
            <div className="dm-saved">
              <i aria-hidden="true">✓</i>
              <b>Saved!</b>
              <span className="dm-dim">Your expense has been recorded.</span>
            </div>
            <Card>
              <p className="dm-big" style={{ margin: '0 0 0.3rem' }}>
                $20.97
              </p>
              <Kv k="Invoice" v="AUTO-000015" />
              <Kv k="Category" v="Groceries" />
              <Kv k="Date" v="2026-03-14" />
            </Card>
            <Btn ghost wide>
              Add another expense
            </Btn>
          </ME>
        ),
      },
      {
        title: 'At year end, run the report',
        note: 'Choose the year. The whole household’s spending is totalled.',
        scene: (go) => (
          <ME on="Reports">
            <Head sub="Invoice dates from 2026-01-01 to 2026-12-31">Reports</Head>
            <Field label="Report period" value="This year" />
            <Tiles
              items={[
                ['$7,912.36', 'Total spending'],
                ['168', 'Expense count'],
                ['$47.10', 'Average expense'],
              ]}
            />
            <div className="dm-line">
              <Btn ghost small>
                PDF
              </Btn>
              <Btn ghost small>
                CSV
              </Btn>
              <Btn ghost small>
                XLSX
              </Btn>
              <Btn go={go} small>
                ZIP with receipts
              </Btn>
            </div>
          </ME>
        ),
      },
      {
        title: 'The accountant’s package',
        note: 'One download: the summary, the full list, and every receipt named by date, shop and amount.',
        scene: () => (
          <ME on="Reports">
            <Head sub="Downloaded to this device">ZIP with receipts</Head>
            {zip}
          </ME>
        ),
      },
    ],
  },
  {
    id: 'household',
    label: 'Share the household',
    summary: 'Invite someone with a role, by a link that works once.',
    device: 'phone',
    steps: [
      {
        title: 'Create an invite',
        note: 'Choose the role first. The link is shown once.',
        scene: (go) => (
          <ME on="Household">
            <Head sub="Household members, roles, and secure invites.">{HOUSE}</Head>
            <Card title="Invite member">
              <Cols>
                <Field label="Role" value="Accountant" />
                <Field label="Expires in days" value="7" />
              </Cols>
              <p className="dm-dim" style={{ margin: '0.3rem 0 0' }}>
                The secure link is shown once. Only its hash is stored.
              </p>
            </Card>
            <Btn go={go} wide>
              Create invite link
            </Btn>
          </ME>
        ),
      },
      {
        title: 'Copy the link',
        note: 'Send it however you like. It can be revoked before it is used.',
        scene: (go) => (
          <ME on="Household">
            <Banner tone="ok" title="Invite link created" />
            <Field label="Invite link" value="https://expenses.example/invite/9f3k…" />
            <Btn go={go} wide>
              Copy
            </Btn>
            <Card title="Pending invites">
              <Kv k="Anyone with link · ACCOUNTANT" v="0 / 1" />
            </Card>
          </ME>
        ),
      },
      {
        title: 'What the accountant sees',
        note: 'The invitation names the household and the role before anything is joined.',
        scene: (go) => (
          <ME on="Household">
            <p className="dm-eyebrow" style={{ color: 'var(--hue-ink)' }}>
              Household invitation
            </p>
            <Head sub="You have been invited to join with the ACCOUNTANT role.">{HOUSE}</Head>
            <Btn go={go} wide>
              Create account
            </Btn>
            <Btn ghost wide>
              Sign in
            </Btn>
            <Note>Expires 2026-03-21. Used 0 of 1 times.</Note>
          </ME>
        ),
      },
      {
        title: 'Three people, three roles',
        note: 'An accountant can read and export. They cannot add or change expenses.',
        scene: () => (
          <ME on="Household">
            <Head sub="Active access to this household.">Members</Head>
            {(
              [
                ['Maya Carter', 'joined 2025-11-02', 'Owner'],
                ['Daniel Carter', 'joined 2026-01-04', 'Member'],
                ['Priya Shah', 'joined 2026-03-15', 'Accountant'],
              ] as const
            ).map(([name, joined, role]) => (
              <div key={name} className="dm-row" data-fresh={role === 'Accountant' || undefined}>
                <span>
                  <b>{name}</b>
                  <small>{joined}</small>
                </span>
                <Pill tone={role === 'Owner' ? 'accent' : 'idle'}>{role}</Pill>
              </div>
            ))}
          </ME>
        ),
      },
    ],
  },
  {
    id: 'find-a-receipt',
    label: 'Find a receipt',
    summary: 'Every expense keeps its receipt. Filter, open it, download it.',
    device: 'phone',
    steps: [
      {
        title: 'Filter the history',
        note: 'By invoice number, category or date range.',
        scene: (go) => (
          <ME on="Expenses">
            <Head sub="Open any expense to preview or download the invoice.">Expense history</Head>
            <Field label="Category" value="Utilities" type />
            <Cols>
              <Field label="From date" value="2026-01-01" />
              <Field label="To date" value="2026-03-31" />
            </Cols>
            <Btn go={go} wide>
              Apply filters
            </Btn>
          </ME>
        ),
      },
      {
        title: 'Open the expense',
        note: 'Each row says who paid and who entered it.',
        scene: (go) => (
          <ME on="Expenses">
            <Head sub="Showing 3 of 41 expenses.">Expense history</Head>
            <button type="button" className="dm-rowbtn dm-hot" onClick={go}>
              <Row title="INV-88231" meta="Utilities | 2026-03-10 | Paid by Maya" value="$80.62" />
            </button>
            <Row title="INV-87164" meta="Utilities | 2026-02-09 | Paid by Maya" value="$76.18" />
            <Row title="AUTO-000004" meta="Utilities | 2026-01-12 | Paid by Daniel" value="$61.68" />
          </ME>
        ),
      },
      {
        title: 'The saved fields and the receipt',
        note: 'The reviewed values sit beside the file they came from.',
        scene: (go) => (
          <ME on="Expenses">
            <Head sub="Utilities | 2026-03-10 | Paid by Maya">INV-88231</Head>
            <Card title="Saved invoice fields">
              <Kv k="Total paid (tax included)" v="$80.62" strong />
              <Kv k="Vendor" v="Prairie Hydro" />
              <Kv k="Payment method" v="e-Transfer" />
            </Card>
            <Cols>
              <Receipt small shop="PRAIRIE HYDRO" total="80.62" />
              <Btn go={go}>Download invoice</Btn>
            </Cols>
          </ME>
        ),
      },
      {
        title: 'Downloaded',
        note: 'Receipts are only served to people signed in to the household.',
        scene: () => (
          <ME on="Expenses">
            <Head sub="Saved to this device">Download invoice</Head>
            <Row title="hydro-bill.pdf" meta="INV-88231 · Prairie Hydro" value="220 KB" clip />
            <Note>The file stays on local storage and is only served through the authenticated invoice route.</Note>
          </ME>
        ),
      },
    ],
  },
  {
    id: 'reports',
    label: 'Monthly report',
    summary: 'Where the money went this month, by category and by member.',
    device: 'phone',
    steps: [
      {
        title: 'Choose the period',
        note: 'Today, this week, this month, this year, or a custom range.',
        scene: (go) => (
          <ME on="Reports">
            <Head sub={HOUSE}>Reports</Head>
            <Field label="Report period" value="This month" />
            <Field label="Category" value="All categories" />
            <Field label="Member (paid by)" value="All members" />
            <Btn go={go} wide>
              Run report
            </Btn>
          </ME>
        ),
      },
      {
        title: 'Totals and categories',
        note: 'The total, the count and the average, then each category.',
        scene: (go) => (
          <ME on="Reports">
            <Tiles
              items={[
                ['$612.40', 'Total spending'],
                ['14', 'Expense count'],
                ['$43.74', 'Average expense'],
              ]}
            />
            <Card title="Category breakdown">
              <Bars
                rows={[
                  ['Groceries', '$231.18', 100],
                  ['Utilities', '$142.30', 62],
                  ['Restaurant', '$96.50', 42],
                  ['Transportation', '$88.42', 38],
                  ['Medical', '$54.00', 23],
                ]}
              />
            </Card>
            <Btn go={go} small>
              Member breakdown
            </Btn>
          </ME>
        ),
      },
      {
        title: 'Who paid, and the months before',
        note: 'Export the same report as a PDF, a spreadsheet, or a ZIP with every receipt.',
        scene: () => (
          <ME on="Reports">
            <Card title="Member breakdown (paid by)">
              <Bars
                rows={[
                  ['Maya Carter', '$371.25', 100],
                  ['Daniel Carter', '$241.15', 65],
                ]}
              />
            </Card>
            <Card title="Monthly totals">
              <Bars
                rows={[
                  ['2026-01', '$702.18', 100],
                  ['2026-02', '$655.90', 93],
                  ['2026-03', '$612.40', 87],
                ]}
              />
            </Card>
            <div className="dm-line">
              <Btn ghost small>
                PDF
              </Btn>
              <Btn ghost small>
                CSV
              </Btn>
              <Btn ghost small>
                XLSX
              </Btn>
              <Btn small>ZIP with receipts</Btn>
            </div>
          </ME>
        ),
      },
    ],
  },
]
