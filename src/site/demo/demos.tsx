/**
 * Demo scripts — one illustrated walkthrough per app (and extra short ones for
 * an app's other tools). The first demo in each list is the main one.
 *
 * IMPORTANT: these are illustrations with made-up sample data, drawn from the
 * product descriptions in products.ts. They are not the real interfaces.
 * TODO(owner): check every step against the real app and correct anything it
 * does not actually do — a demo must never show a capability the app lacks.
 *
 * To add a demo: append to the product's list. A step is a title, one line of
 * explanation, and a scene built from the kit; give a control `go` to make it
 * the highlighted next action, or set `auto` (ms) for a step that moves on by itself.
 */
import type { ReactNode } from 'react'
import { Bars, Btn, Card, Chips, Cols, Doc, Dropzone, Field, Files, Head, Kv, Log, Note, Progress, Receipt, Row, Table, Toast, type Go } from './kit'

export interface DemoStep {
  title: string
  note: string
  scene: (go: Go) => ReactNode
  /** Milliseconds after which the step advances on its own (for progress-style steps). */
  auto?: number
}
export interface Demo {
  id: string
  label: string
  /** One line saying what the walkthrough shows. */
  summary: string
  device: 'phone' | 'window'
  steps: DemoStep[]
}

/* ————————————————— MyFamilyExpenses ————————————————— */
const household = (
  <>
    <Row title="Electricity bill" meta="Bills · Jordan" value="$96.40" clip />
    <Row title="School shoes" meta="Kids · Alex" value="$54.00" />
  </>
)

const myfamilyexpenses: Demo[] = [
  {
    id: 'receipt-to-report',
    label: 'A receipt, start to finish',
    summary: 'One receipt, from the photo to the year-end report.',
    device: 'phone',
    steps: [
      {
        title: 'Start a new expense',
        note: 'The household keeps one shared list. Anyone in it can add to it.',
        scene: (go) => (
          <>
            <Head sub="March · sample household">Our household</Head>
            <Kv k="Spent this month" v="$1,284.10" strong />
            {household}
            <Btn go={go} wide>
              + Add expense
            </Btn>
          </>
        ),
      },
      {
        title: 'Add the receipt',
        note: 'The receipt is kept with the expense it belongs to.',
        scene: (go) => (
          <>
            <Head>New expense</Head>
            <Dropzone>
              <b>Add a photo of the receipt</b>
              <span>Take a photo or choose a file</span>
              <Btn go={go}>Choose file</Btn>
            </Dropzone>
          </>
        ),
      },
      {
        title: 'Pick the photo',
        note: 'A sample file stands in for your photo. Nothing is uploaded anywhere.',
        scene: (go) => (
          <>
            <Head>New expense</Head>
            <Files
              pick={0}
              go={go}
              files={[
                ['receipt.jpg', '1.2 MB'],
                ['IMG_2041.jpg', '2.8 MB'],
                ['IMG_2040.jpg', '3.1 MB'],
              ]}
            />
          </>
        ),
      },
      {
        title: 'The receipt is attached',
        note: 'The photo uploads and stays with this expense.',
        auto: 2300,
        scene: () => (
          <>
            <Head>New expense</Head>
            <Receipt />
            <Progress label="Uploading receipt.jpg" />
          </>
        ),
      },
      {
        title: 'Fill in the details',
        note: 'Where it was spent, how much, what it was for, and who paid.',
        scene: (go) => (
          <>
            <Head>New expense</Head>
            <Cols>
              <Receipt small />
              <Note>receipt.jpg attached</Note>
            </Cols>
            <Field label="Shop" value="Corner Market" type />
            <Field label="Amount" value="$84.20" type delay={500} />
            <Field label="Category" value="Groceries" type delay={900} />
            <Field label="Paid by" value="Alex" type delay={1300} />
            <Btn go={go} wide>
              Save expense
            </Btn>
          </>
        ),
      },
      {
        title: 'It joins the household list',
        note: 'Everyone in the household now sees it, receipt included.',
        scene: (go) => (
          <>
            <Head sub="March · sample household">Our household</Head>
            <Kv k="Spent this month" v="$1,368.30" strong />
            <Row title="Corner Market" meta="Groceries · Alex" value="$84.20" clip fresh />
            {household}
            <Btn go={go} wide>
              Open reports
            </Btn>
          </>
        ),
      },
      {
        title: 'At the end of the year',
        note: 'A year of expenses becomes one report showing where the money went.',
        scene: (go) => (
          <>
            <Head sub="January – December · sample figures">Year-end report</Head>
            <Kv k="Total spent" v="$18,460.00" strong />
            <Bars
              rows={[
                ['Groceries', '$6,240', 100],
                ['Bills', '$4,910', 79],
                ['Kids', '$3,380', 54],
                ['Transport', '$2,470', 40],
                ['Other', '$1,460', 23],
              ]}
            />
            <Btn go={go} wide>
              Send report
            </Btn>
          </>
        ),
      },
      {
        title: 'The report is sent',
        note: 'One document for the whole year, with every receipt behind it.',
        scene: () => (
          <>
            <Head>Year-end report</Head>
            <Toast>Report sent</Toast>
            <Doc title="Household report — full year" sections={['Summary', 'By category', 'Receipts']} />
          </>
        ),
      },
    ],
  },
]

/* ————————————————— SamVisionAI ————————————————— */
const comps: string[][] = [
  ['8 Sample Road', '$498,000', '1,580', '$315'],
  ['31 Demo Avenue', '$525,000', '1,700', '$309'],
  ['5 Placeholder Court', '$489,000', '1,560', '$313'],
]

const samvisionai: Demo[] = [
  {
    id: 'analyse-a-property',
    label: 'Analyse a property',
    summary: 'One property, from the address to a report for the client.',
    device: 'window',
    steps: [
      {
        title: 'Start with the property',
        note: 'Everything begins from one address.',
        scene: (go) => (
          <>
            <Head sub="Sample data">Property analysis</Head>
            <Field label="Address" value="12 Example Lane" type />
            <Btn go={go}>Analyse</Btn>
          </>
        ),
      },
      {
        title: 'The property in one view',
        note: 'A structured look at a single property.',
        scene: (go) => (
          <>
            <Head sub="12 Example Lane">Property analysis</Head>
            <Cols>
              <Card title="The property">
                <Kv k="Listed at" v="$512,000" strong />
                <Kv k="Bedrooms · bathrooms" v="3 · 2" />
                <Kv k="Floor area" v="1,640 sq ft" />
                <Kv k="Built" v="2004" />
              </Card>
              <Card title="At a glance">
                <Kv k="Price per sq ft" v="$312" strong />
                <Kv k="Lot" v="0.21 acres" />
                <Kv k="Days listed" v="21" />
              </Card>
            </Cols>
            <Btn go={go}>Compare with the market</Btn>
          </>
        ),
      },
      {
        title: 'Read the market around it',
        note: 'Comparable properties, read side by side.',
        scene: (go) => (
          <>
            <Head sub="12 Example Lane">Comparable properties</Head>
            <Table head={['Property', 'Sold for', 'Sq ft', 'Per sq ft']} rows={comps} />
            <Kv k="Comparable range" v="$489,000 – $525,000" strong />
            <Btn go={go}>Weigh the decision</Btn>
          </>
        ),
      },
      {
        title: 'Weigh the decision',
        note: 'The analysis is organised around the decision in front of you.',
        scene: (go) => (
          <>
            <Head sub="12 Example Lane">Decision support</Head>
            <Bars
              rows={[
                ['Listed price', '$512,000', 86],
                ['Comparable low', '$489,000', 62],
                ['Comparable high', '$525,000', 100],
              ]}
            />
            <Card>
              <Kv k="Against comparables" v="Within the range" strong />
              <Kv k="Per sq ft against comparables" v="In line" />
            </Card>
            <Btn go={go}>Create client report</Btn>
          </>
        ),
      },
      {
        title: 'Hand over the report',
        note: 'The findings are assembled into a report made for the client.',
        scene: () => (
          <>
            <Head sub="12 Example Lane">Client report</Head>
            <Toast>Report ready to share</Toast>
            <Doc title="Property report — 12 Example Lane" sections={['The property', 'Comparable properties', 'Decision summary']} />
          </>
        ),
      },
    ],
  },
  {
    id: 'comparables',
    label: 'Comparable properties',
    summary: 'Choose the comparables and read the range they give.',
    device: 'window',
    steps: [
      {
        title: 'Choose what to compare with',
        note: 'Pick the properties that are genuinely comparable.',
        scene: (go) => (
          <>
            <Head sub="12 Example Lane · sample data">Comparable properties</Head>
            <Row tick title="8 Sample Road" meta="1,580 sq ft · sold 2 months ago" value="$498,000" />
            <Row tick title="31 Demo Avenue" meta="1,700 sq ft · sold 3 months ago" value="$525,000" />
            <Row tick title="5 Placeholder Court" meta="1,560 sq ft · sold 5 months ago" value="$489,000" />
            <Row tick={false} title="77 Mock Street" meta="2,400 sq ft · sold 11 months ago" value="$710,000" />
            <Btn go={go}>Compare these three</Btn>
          </>
        ),
      },
      {
        title: 'Read them side by side',
        note: 'The same facts for each, in the same order.',
        scene: (go) => (
          <>
            <Head sub="3 selected">Comparable properties</Head>
            <Table head={['Property', 'Sold for', 'Sq ft', 'Per sq ft']} rows={comps} />
            <Btn go={go}>Show the range</Btn>
          </>
        ),
      },
      {
        title: 'The range they give',
        note: 'Where this property sits against the ones like it.',
        scene: () => (
          <>
            <Head sub="12 Example Lane">Comparable range</Head>
            <Bars
              rows={[
                ['5 Placeholder Court', '$489,000', 62],
                ['8 Sample Road', '$498,000', 71],
                ['This property', '$512,000', 86],
                ['31 Demo Avenue', '$525,000', 100],
              ]}
            />
            <Kv k="Comparable range" v="$489,000 – $525,000" strong />
          </>
        ),
      },
    ],
  },
  {
    id: 'decision',
    label: 'Decision support',
    summary: 'Two properties, weighed on what matters to the client.',
    device: 'window',
    steps: [
      {
        title: 'Put two properties side by side',
        note: 'A decision is usually a choice between options.',
        scene: (go) => (
          <>
            <Head sub="Sample data">Decision support</Head>
            <Cols>
              <Card title="12 Example Lane">
                <Kv k="Listed at" v="$512,000" />
                <Kv k="Floor area" v="1,640 sq ft" />
              </Card>
              <Card title="40 Specimen Way">
                <Kv k="Listed at" v="$540,000" />
                <Kv k="Floor area" v="1,820 sq ft" />
              </Card>
            </Cols>
            <Btn go={go}>Choose what matters</Btn>
          </>
        ),
      },
      {
        title: 'Say what matters',
        note: 'The comparison follows the client’s priorities, not a fixed template.',
        scene: (go) => (
          <>
            <Head sub="Two properties">What matters most?</Head>
            <Chips items={['Price', 'Space', 'Price per sq ft', 'Lot size', 'Age']} on={[0, 1, 2]} />
            <Btn go={go}>Compare</Btn>
          </>
        ),
      },
      {
        title: 'See them weighed',
        note: 'The same three questions, answered for both.',
        scene: () => (
          <>
            <Head sub="Price · Space · Price per sq ft">Side by side</Head>
            <Table
              head={['', '12 Example Lane', '40 Specimen Way']}
              rows={[
                ['Price', '$512,000', '$540,000'],
                ['Space', '1,640 sq ft', '1,820 sq ft'],
                ['Per sq ft', '$312', '$297'],
              ]}
            />
            <Note>Lower price at Example Lane; more space and a lower price per square foot at Specimen Way.</Note>
          </>
        ),
      },
    ],
  },
  {
    id: 'client-report',
    label: 'Client report',
    summary: 'Choose what goes in, and the report is assembled.',
    device: 'window',
    steps: [
      {
        title: 'Choose what goes in',
        note: 'A report holds what this client needs, and nothing else.',
        scene: (go) => (
          <>
            <Head sub="12 Example Lane · sample data">New client report</Head>
            <Row tick title="The property" meta="Facts and figures" />
            <Row tick title="Comparable properties" meta="3 selected" />
            <Row tick title="Decision summary" meta="Against comparables" />
            <Row tick={false} title="Second property" meta="40 Specimen Way" />
            <Btn go={go}>Build report</Btn>
          </>
        ),
      },
      {
        title: 'The report is assembled',
        note: 'The chosen findings, put together in order.',
        auto: 2200,
        scene: () => (
          <>
            <Head>New client report</Head>
            <Progress label="Assembling 3 sections" />
          </>
        ),
      },
      {
        title: 'Ready for the client',
        note: 'One document to hand over.',
        scene: () => (
          <>
            <Head sub="12 Example Lane">Client report</Head>
            <Toast>Report ready to share</Toast>
            <Doc title="Property report — 12 Example Lane" sections={['The property', 'Comparable properties', 'Decision summary']} />
          </>
        ),
      },
    ],
  },
]

/* ————————————————— GYST / LifeOps ————————————————— */
const gyst: Demo[] = [
  {
    id: 'plan-a-week',
    label: 'Plan a week',
    summary: 'A task, a routine and a plan, joined up in one week.',
    device: 'window',
    steps: [
      {
        title: 'Start from the week',
        note: 'A plan you can see the whole of.',
        scene: (go) => (
          <>
            <Head sub="Sample data">This week</Head>
            <Row tick={false} title="Book dentist" meta="Tuesday" />
            <Row tick title="Pay council tax" meta="Monday · done" />
            <Btn go={go}>+ Add task</Btn>
          </>
        ),
      },
      {
        title: 'Add what needs doing',
        note: 'What needs doing, in one place.',
        scene: (go) => (
          <>
            <Head>New task</Head>
            <Field label="Task" value="Renew passport" type />
            <Field label="Day" value="Thursday" type delay={600} />
            <Btn go={go}>Add to the week</Btn>
          </>
        ),
      },
      {
        title: 'Give recurring things a rhythm',
        note: 'A routine repeats on its own, so it never has to be re-entered.',
        scene: (go) => (
          <>
            <Head>New routine</Head>
            <Field label="Routine" value="Morning walk" type />
            <Field label="Repeats" value="Every weekday" type delay={600} />
            <Field label="Time" value="7:00" type delay={1100} />
            <Btn go={go}>Save routine</Btn>
          </>
        ),
      },
      {
        title: 'Link it to a plan',
        note: 'The pieces are linked rather than scattered.',
        scene: (go) => (
          <>
            <Head sub="Renew passport">Task</Head>
            <Kv k="Day" v="Thursday" />
            <Card title="Linked to">
              <Row title="Trip in June" meta="Plan · 4 tasks" />
            </Card>
            <Btn go={go}>See the week</Btn>
          </>
        ),
      },
      {
        title: 'The week, joined up',
        note: 'Tasks, routines and plans in one view.',
        scene: () => (
          <>
            <Head sub="Sample data">This week</Head>
            <Row tick title="Pay council tax" meta="Monday · done" />
            <Row tick={false} title="Book dentist" meta="Tuesday" />
            <Row tick={false} title="Renew passport" meta="Thursday · Trip in June" fresh />
            <Row title="Morning walk" meta="Routine · every weekday · 7:00" fresh />
          </>
        ),
      },
    ],
  },
]

/* ————————————————— CommandCenter (internal) ————————————————— */
const commandcenter: Demo[] = [
  {
    id: 'request-to-approval',
    label: 'A change, from request to approval',
    summary: 'An illustration of the flow. No real project or system is shown.',
    device: 'window',
    steps: [
      {
        title: 'A piece of work is tracked',
        note: 'Work is tracked where the work happens.',
        scene: (go) => (
          <>
            <Head sub="Made-up example">Tasks</Head>
            <Row tick={false} title="Update the footer link" meta="Sample project · not started" />
            <Row tick title="Fix the date format" meta="Sample project · done" />
            <Btn go={go}>Assign to an agent</Btn>
          </>
        ),
      },
      {
        title: 'An agent does the work',
        note: 'Orchestration for agents doing engineering work.',
        auto: 2600,
        scene: () => (
          <>
            <Head sub="Update the footer link">Agent</Head>
            <Log lines={['Reading the task', 'Making the change', 'Opening the change for review']} />
          </>
        ),
      },
      {
        title: 'Checks run on the change',
        note: 'Continuous integration, operated from one surface.',
        scene: (go) => (
          <>
            <Head sub="Update the footer link">Checks</Head>
            <Row tick title="Build" meta="Passed" />
            <Row tick title="Tests" meta="Passed" />
            <Row tick title="Lint" meta="Passed" />
            <Btn go={go}>Request approval</Btn>
          </>
        ),
      },
      {
        title: 'A person signs it off',
        note: 'Sign-off is a step in the flow, not an afterthought.',
        scene: (go) => (
          <>
            <Head sub="Update the footer link">Approval</Head>
            <Kv k="Checks" v="3 of 3 passed" />
            <Kv k="Waiting for" v="Approval" strong />
            <Btn go={go}>Approve</Btn>
          </>
        ),
      },
      {
        title: 'The path, made explicit',
        note: 'Every step the change took is on record.',
        scene: () => (
          <>
            <Head sub="Update the footer link">Done</Head>
            <Toast>Approved and merged</Toast>
            <Row tick title="Assigned to an agent" />
            <Row tick title="Checks passed" />
            <Row tick title="Approved" />
          </>
        ),
      },
    ],
  },
]

/* ————————————————— GauzeMate (prototype) ————————————————— */
const gauzemate: Demo[] = [
  {
    id: 'reminder',
    label: 'Set a medication reminder',
    summary: 'A made-up medication, from adding it to marking it taken.',
    device: 'phone',
    steps: [
      {
        title: 'Add a medication',
        note: 'Everything starts from the medication itself.',
        scene: (go) => (
          <>
            <Head sub="Prototype · sample data">Medications</Head>
            <Note>Nothing added yet.</Note>
            <Btn go={go} wide>
              + Add medication
            </Btn>
          </>
        ),
      },
      {
        title: 'Name it',
        note: 'A made-up name is used here. This demo contains no medical information.',
        scene: (go) => (
          <>
            <Head>New medication</Head>
            <Field label="Name" value="Sample medication" type />
            <Field label="Strength" value="250 mg" type delay={700} />
            <Btn go={go} wide>
              View information
            </Btn>
          </>
        ),
      },
      {
        title: 'Read about it',
        note: 'Information about the medication, presented clearly.',
        scene: (go) => (
          <>
            <Head sub="Sample medication 250 mg">Information</Head>
            <Card title="Placeholder text">
              <Note>In the app this card shows information about the medication. None is shown in this demo.</Note>
            </Card>
            <Btn go={go} wide>
              Set a reminder
            </Btn>
          </>
        ),
      },
      {
        title: 'Set the reminder',
        note: 'A prompt at the moment it matters.',
        scene: (go) => (
          <>
            <Head sub="Sample medication 250 mg">Reminder</Head>
            <Field label="Time" value="8:00 in the morning" type />
            <Field label="Repeats" value="Every day" type delay={700} />
            <Btn go={go} wide>
              Save reminder
            </Btn>
          </>
        ),
      },
      {
        title: 'The reminder arrives',
        note: 'When the time comes, the app says so.',
        scene: (go) => (
          <>
            <Head sub="8:00">Reminder</Head>
            <Card title="Time for your medication">
              <Kv k="Sample medication" v="250 mg" strong />
            </Card>
            <Btn go={go} wide>
              Mark as taken
            </Btn>
          </>
        ),
      },
      {
        title: 'Marked as taken',
        note: 'Today’s dose is recorded.',
        scene: () => (
          <>
            <Head sub="Prototype · sample data">Medications</Head>
            <Toast>Taken today at 8:00</Toast>
            <Row tick title="Sample medication 250 mg" meta="Every day · 8:00" />
          </>
        ),
      },
    ],
  },
]

export const demos: Record<string, Demo[]> = { samvisionai, myfamilyexpenses, gyst, commandcenter, gauzemate }
