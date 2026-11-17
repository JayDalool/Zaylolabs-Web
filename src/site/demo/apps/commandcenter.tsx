/* eslint-disable react/jsx-key -- table cells are keyed by the kit */
/**
 * Command Center — redrawn from the Engineering HQ interface (hq/pages/Office.tsx,
 * Engineering.tsx, Decisions.tsx, DecisionAnswer.tsx, tickets/GateCard.tsx,
 * components/Merge.tsx). Projects, tasks, pull requests and people are made up.
 * The app's own wording names its agent; here it is written as "the agent".
 */
import type { ReactNode } from 'react'
import { Btn, Card, Gate, Head, Kv, Log, Note, Pill, Shell, Table, Tabs, Tiles, Toast, type Go, type Tone } from '../kit'
import type { Demo } from '../types'

const NAV = ['My Office', 'Messages', 'Decisions', 'Teams', 'Company', 'Engineering', 'Revenue', 'Workspace', 'Activity', 'Files']
const BRAND = (
  <>
    Command<i>Center</i>
  </>
)

function CC({ on, title, actions, hot, go, children }: { on: string; title: string; actions?: ReactNode; hot?: string; go?: Go; children: ReactNode }) {
  return (
    <Shell brand={BRAND} sub="Engineering HQ" nav={NAV} on={on} title={title} actions={actions} hot={hot} go={go}>
      {children}
    </Shell>
  )
}
const key = (k: string) => <span className="dm-key">{k}</span>
const dot = (word: string, tone: Tone) => (
  <Pill tone={tone} dot>
    {word}
  </Pill>
)
const TASK = 'ATL-142'
const TITLE = 'Add CSV export to the invoices table'

const work = (at: number) => (
  <div className="dm-work" aria-label="Pipeline">
    {['PLAN', 'BUILD', 'REVIEW', 'MERGE', 'VERIFY'].map((s, i) => (
      <span key={s} data-s={i < at ? 'done' : i === at ? 'now' : undefined}>
        {i < at ? '✓' : i === at ? '●' : '—'} {s}
      </span>
    ))}
  </div>
)
const ticketHead = (stage: string, tone: Tone) => (
  <div className="dm-line">
    <span>
      {key(TASK)} <span className="dm-dim">· Atlas</span>
      <br />
      <b>{TITLE}</b>
    </span>
    {dot(stage, tone)}
  </div>
)
const stages = (pick?: number, go?: Go) => (
  <Tiles
    pick={pick}
    go={go}
    items={[
      ['3', 'Planning', 'idle'],
      ['4', 'Implementing', 'violet'],
      ['2', 'Reviewing', 'info'],
      ['1', 'Verifying', 'info'],
      ['2', 'Ready to Merge', 'ok'],
      ['3', 'Needs you', 'warn'],
      ['1', 'Blocked', 'bad'],
    ]}
  />
)

export const commandcenter: Demo[] = [
  {
    id: 'task-to-release',
    label: 'From a task to a release',
    summary: 'One task, from the plan to the release. The agents do the work; a person approves the plan, the merge and the release.',
    device: 'window',
    steps: [
      {
        title: 'Every open task, by stage',
        note: 'Engineering shows all open tasks across the projects, from live data.',
        scene: (go) => (
          <CC on="Engineering" title="Engineering" actions={<Btn small>New task</Btn>}>
            {stages()}
            <Card title="Workbench · 3 shown">
              <Table
                head={['Key', 'Title', 'Stage', 'Session']}
                wide={[3]}
                rows={[
                  [
                    <button type="button" className="dm-rowbtn dm-hot dm-key" onClick={go}>
                      {TASK}
                    </button>,
                    TITLE,
                    dot('Planning', 'idle'),
                    dot('Working', 'ok'),
                  ],
                  [key('HBR-88'), 'Fix timezone drift in the booking calendar', dot('Implementing', 'violet'), dot('Working', 'ok')],
                  [key('LUM-57'), 'Rate-limit the public search endpoint', dot('Blocked', 'bad'), dot('Idle', 'idle')],
                ]}
              />
            </Card>
          </CC>
        ),
      },
      {
        title: 'The plan waits for you',
        note: 'Nothing is built until a person has read the plan and approved it.',
        scene: (go) => (
          <CC on="Engineering" title="Engineering">
            {ticketHead('Planning', 'idle')}
            {work(0)}
            <Gate
              tone="violet"
              title="The plan needs your approval"
              actions={
                <>
                  <Btn go={go} small>
                    Approve plan
                  </Btn>
                  <Btn ghost small>
                    Re-plan
                  </Btn>
                </>
              }
            >
              Add an Export button to the invoices table and stream the current filter as CSV. Three files, no schema change. Why you: it adds a new download
              endpoint.
            </Gate>
          </CC>
        ),
      },
      {
        title: 'Agents build and review',
        note: 'One session builds. A separate, fresh session reviews. Checks run on the pull request.',
        auto: 4200,
        scene: () => (
          <CC on="Engineering" title="Engineering">
            {ticketHead('Implementing', 'violet')}
            {work(1)}
            <Log lines={['Developer session started on atl-142-csv-export', 'Pull request #214 opened', 'Checks passing on #214', 'Code reviewer approved head a41c9e2']} />
          </CC>
        ),
      },
      {
        title: 'Reviewed and green — your acceptance',
        note: 'A reviewed, passing change still waits. Your acceptance covers one exact commit.',
        scene: (go) => (
          <CC on="Engineering" title="Engineering">
            {ticketHead('Ready to Merge', 'ok')}
            {work(3)}
            <Card title="Development">
              <div className="dm-line">
                <span>PR {key('#214')}</span>
                <Pill tone="ok">CI PASS</Pill>
                <Pill tone="ok">APPROVED</Pill>
                <Pill tone="warn">WAITING FOR YOU</Pill>
              </div>
            </Card>
            <Gate
              tone="ok"
              title="Reviewed and green — your acceptance"
              actions={
                <>
                  <Btn go={go} small>
                    Accept — allow merge
                  </Btn>
                  <Btn ghost small>
                    Request changes
                  </Btn>
                </>
              }
            >
              A fresh reviewer approved the exact head a41c9e2 on #214. Accepting lets the agent merge this head (a new commit needs a new review).
            </Gate>
          </CC>
        ),
      },
      {
        title: 'Verified, then your go-ahead to release',
        note: 'Merging is not releasing. Going live is a separate decision.',
        scene: (go) => (
          <CC on="Engineering" title="Engineering">
            {ticketHead('Verifying', 'info')}
            {work(4)}
            <Gate
              tone="warn"
              title="Ready for live deployment"
              actions={
                <>
                  <Btn go={go} small>
                    Approve live deploy
                  </Btn>
                  <Btn ghost small>
                    Not yet — fix first
                  </Btn>
                </>
              }
            >
              What will go live: CSV export on the invoices table. Verification completed: checks passing on main, UI accepted.
            </Gate>
          </CC>
        ),
      },
      {
        title: 'Done, and on the record',
        note: 'Every step is in the activity record, with who decided what.',
        scene: () => (
          <CC on="Activity" title="Activity">
            <Tabs seg items={['All', 'Agents', 'Tasks', 'Pull requests', 'CI', 'You']} on={0} />
            <Table
              head={['', '', '']}
              rows={[
                ['11:30', <Pill tone="accent">YOU</Pill>, `Live deploy approved · ${TASK}`],
                ['11:02', <Pill tone="accent">YOU</Pill>, 'Merge accepted · a41c9e2'],
                ['10:58', <Pill tone="info">CI</Pill>, 'Checks passed on #214'],
                ['10:41', <Pill tone="info">PRS</Pill>, 'Pull request #214 opened'],
                ['09:20', <Pill tone="accent">YOU</Pill>, `Plan approved · ${TASK}`],
                ['09:12', <Pill>TASKS</Pill>, `${TASK} created`],
              ]}
            />
          </CC>
        ),
      },
    ],
  },
  {
    id: 'office',
    label: 'My Office',
    summary: 'The morning view: what happened, what is healthy, and what is waiting for you.',
    device: 'window',
    steps: [
      {
        title: 'Start the day',
        note: 'Counts come from live data. If a feed is stale, the status reads Unknown, never Working.',
        scene: (go) => (
          <CC on="My Office" title="My Office">
            <Head sub="What is happening across your projects, from live data.">Good morning, Alex</Head>
            <Tiles
              pick={2}
              go={go}
              items={[
                ['5', 'Projects · 4 healthy'],
                ['7', 'Sessions · 5 working'],
                ['3', 'Needs you · 1 urgent', 'warn'],
                ['Degraded', 'Health', 'warn'],
              ]}
            />
            <Card title="Briefing since 21:00">
              <div className="dm-line">
                <span>Merged {key('4')}</span>
                <span>Done {key('3')}</span>
                <span>PRs opened {key('5')}</span>
                <span>Checks failed {key('1')}</span>
                <span>Deploys {key('1')}</span>
              </div>
            </Card>
          </CC>
        ),
      },
      {
        title: 'What needs your attention',
        note: 'Each item says what kind of decision it is, and how long it has waited.',
        scene: (go) => (
          <CC on="My Office" title="My Office">
            <Card title="Needs your attention">
              <Table
                head={['', '', '']}
                wide={[2]}
                rows={[
                  [<Pill tone="ok">Merge</Pill>, `${TASK} ${TITLE}`, 'Atlas · 6m'],
                  [<Pill tone="violet">Plan</Pill>, 'HBR-91 Move booking emails to a queue', 'Harbor · 31m'],
                  [<Pill tone="bad">CI red</Pill>, 'Main branch checks are failing', 'Lumen · 1h'],
                ]}
              />
            </Card>
            <Btn go={go} small>
              View all 3
            </Btn>
          </CC>
        ),
      },
      {
        title: 'Each project, at a glance',
        note: 'Health comes with its reason, not just a colour.',
        scene: () => (
          <CC on="My Office" title="My Office">
            <Card title="Projects">
              <Table
                head={['Project', 'Health', 'Needs you', 'In progress', 'To merge']}
                num={[2, 3, 4]}
                wide={[3]}
                rows={[
                  ['Atlas', dot('Healthy', 'ok'), '1', '2', '2'],
                  ['Harbor', dot('Healthy', 'ok'), '1', '1', '0'],
                  ['Lumen', dot('Degraded · Main failing', 'warn'), '1', '1', '0'],
                  ['Kestrel', dot('Healthy', 'ok'), '0', '0', '0'],
                ]}
              />
            </Card>
          </CC>
        ),
      },
    ],
  },
  {
    id: 'decisions',
    label: 'Answer a question',
    summary: 'When an agent needs a decision, it asks. You answer in place and it carries on.',
    device: 'window',
    steps: [
      {
        title: 'Everything waiting for you',
        note: 'Questions, plans, reviews, merges and deploys, in one list.',
        scene: (go) => (
          <CC on="Decisions" title="Decisions">
            <Tiles
              items={[
                ['1', 'Decisions'],
                ['1', 'Questions', 'warn'],
                ['1', 'Reviews'],
                ['2', 'Approvals'],
                ['0', 'Actions'],
              ]}
            />
            <Card title="Waiting for you">
              <div className="dm-line">
                <span>
                  <Pill tone="warn">Needs input</Pill> {key('KES-31')} Choose the retry policy for failed webhooks
                  <br />
                  <span className="dm-dim">Question · Kestrel · 14m</span>
                </span>
                <Btn go={go} small>
                  Answer here
                </Btn>
              </div>
            </Card>
          </CC>
        ),
      },
      {
        title: 'Pick an answer',
        note: 'The agent gives options and says which it recommends, and why.',
        scene: (go) => (
          <CC on="Decisions" title="Decisions">
            <b>How should failed webhooks be retried?</b>
            <div className="dm-opt" data-on="">
              <span>
                Exponential backoff, five attempts <Pill tone="accent">RECOMMENDED</Pill>
              </span>
              <small>Matches how the other integrations already retry.</small>
            </div>
            <div className="dm-opt">
              <span>Fixed interval, three attempts</span>
            </div>
            <div className="dm-opt" data-dashed="">
              <span>Something else</span>
              <small>Write your own answer</small>
            </div>
            <Btn go={go} small>
              Send answer
            </Btn>
          </CC>
        ),
      },
      {
        title: 'Sent, and the work resumes',
        note: 'The answer goes to the session working on that task.',
        scene: () => (
          <CC on="Decisions" title="Decisions">
            <Toast>Sent to the task’s session.</Toast>
            <Card title="Summary">
              <Kv k="Blocking someone" v="0" />
              <Kv k="Urgent" v="1" />
              <Kv k="Approvals pending" v="2" />
              <Kv k="Overdue" v="0" />
            </Card>
          </CC>
        ),
      },
    ],
  },
  {
    id: 'merge-ready',
    label: 'Merge what is ready',
    summary: 'Reviewed, passing pull requests are merged in order, when you say so. Nothing is released.',
    device: 'window',
    steps: [
      {
        title: 'The release gate',
        note: 'These pull requests are reviewed and passing. They wait here.',
        scene: (go) => (
          <CC on="Engineering" title="Engineering">
            <Card title="Release gate · Ready to merge">
              <Table
                head={['Key', 'Title', '']}
                wide={[2]}
                rows={[
                  [key(TASK), `${TITLE} · Pull request #214 · Atlas`, dot('Awaiting merge', 'ok')],
                  [key('ATL-139'), 'Tidy invoice number formatting · Pull request #211 · Atlas', dot('Awaiting merge', 'ok')],
                  [key('HBR-84'), 'Show the booking timezone · Pull request #77 · Harbor', dot('Awaiting merge', 'ok')],
                ]}
              />
              <p className="dm-dim" style={{ margin: '0.4rem 0 0' }}>
                You merge. Nothing on this page merges.
              </p>
            </Card>
            <Btn go={go} small>
              Merge ready
            </Btn>
          </CC>
        ),
      },
      {
        title: 'One repository at a time',
        note: 'Each repository’s agent merges its pull requests in order.',
        scene: (go) => (
          <CC on="Engineering" title="Engineering">
            <div className="dm-dialog">
              <b>Merge ready</b>
              <Note>Each repository’s agent merges its PRs one at a time, in this order. Nothing is deployed — that stays Go Live.</Note>
              <div className="dm-line">
                <span>
                  <b>Atlas</b> <span className="dm-dim">2 ready · 0 not mergeable</span>
                </span>
                <Btn ghost small>
                  Merge 2
                </Btn>
              </div>
              <div className="dm-line">
                <span>
                  <b>Harbor</b> <span className="dm-dim">1 ready · 0 not mergeable</span>
                </span>
                <Btn ghost small>
                  Merge 1
                </Btn>
              </div>
              <Btn go={go} small>
                Merge all ready (3)
              </Btn>
            </div>
          </CC>
        ),
      },
      {
        title: 'Confirm',
        note: 'A merge is never one click.',
        scene: (go) => (
          <CC on="Engineering" title="Engineering">
            <div className="dm-dialog">
              <b>Merge 3 PRs in 2 repositories?</b>
              <div className="dm-line">
                <Btn go={go} small>
                  Yes, merge
                </Btn>
                <Btn ghost small>
                  Cancel
                </Btn>
              </div>
            </div>
          </CC>
        ),
      },
      {
        title: 'Merged, not released',
        note: 'The tasks move to Verifying. Going live is still its own approval.',
        scene: () => (
          <CC on="Engineering" title="Engineering">
            {stages()}
            <Card title="Release gate · Ready to merge">
              <p className="dm-dim" style={{ margin: 0 }}>
                Nothing is waiting for your merge.
              </p>
            </Card>
          </CC>
        ),
      },
    ],
  },
]
