/* eslint-disable react/jsx-key -- table cells are keyed by the kit */
/**
 * GYST — redrawn from the app's own templates (today.html, layout.html quick
 * capture, projects_list.html, project_detail.html, health.html,
 * health_coach.html). Every task, project and health figure is made up.
 */
import type { ReactNode } from 'react'
import { Bars, Btn, Bubble, Card, Chips, Cols, Field, Head, Kv, Note, Pill, Progress, Ring, Row, Shell, Tabs, Toast, type Go } from '../kit'
import type { Demo } from '../types'

const NAV = ['Today', 'Projects', 'Health', 'Courses', 'Menu']

function GY({ on, hot, go, children }: { on: string; hot?: string; go?: Go; children: ReactNode }) {
  return (
    <Shell brand="GYST" nav={NAV} on={on} hot={hot} go={go}>
      {children}
    </Shell>
  )
}
const checklist = (done: boolean, go?: Go) => {
  const first = <Row title="Review pull request" meta="coding · daily · high" tick={done} />
  return (
    <Card title={done ? 'Today’s checklist · 2 done · 1 left' : 'Today’s checklist · 1 done · 2 left'}>
      {go ? (
        <button type="button" className="dm-rowbtn dm-hot" onClick={go}>
          {first}
        </button>
      ) : (
        first
      )}
      <Row title="Call the garage" meta="personal · none · high" tick={false} fresh={!done} />
      <Row title="Mobility routine" meta="health · daily · medium" tick />
    </Card>
  )
}

export const gyst: Demo[] = [
  {
    id: 'a-day',
    label: 'A day in GYST',
    summary: 'One day, from the task list to projects, health and the coach.',
    device: 'window',
    steps: [
      {
        title: 'Today',
        note: 'The day opens on what is due today. Quick capture is one key away.',
        scene: (go) => (
          <GY on="Today">
            <div className="dm-line">
              <Head sub="Nov 16, 2026">Today</Head>
              <Btn go={go} small ghost>
                Search and quick capture · Ctrl K
              </Btn>
            </div>
            <Card>
              <b>A focused today.</b>
              <p className="dm-dim" style={{ margin: 0 }}>
                Small steps build the life you want.
              </p>
            </Card>
            <Card title="Today’s checklist · 1 done · 1 left">
              <Row title="Review pull request" meta="coding · daily · high" tick={false} />
              <Row title="Mobility routine" meta="health · daily · medium" tick />
            </Card>
          </GY>
        ),
      },
      {
        title: 'Capture a task in one line',
        note: 'Type it in one line. “!high” sets the priority, and a word like “tomorrow” would set the date.',
        scene: (go) => (
          <GY on="Today">
            <div className="dm-dialog">
              <Tabs seg items={['Go', 'Capture']} on={1} />
              <Field label="Quick task" value="Call the garage !high" type />
              <Cols>
                <Field label="Due" value="Nov 16, 2026" />
                <Field label="Priority" value="High" />
                <Field label="Category" value="personal" />
              </Cols>
              <Btn go={go}>Add task</Btn>
            </div>
          </GY>
        ),
      },
      {
        title: 'Tick it off',
        note: 'The new task is on the list. Finishing a task earns XP.',
        scene: (go) => (
          <GY on="Today">
            <Head sub="Nov 16, 2026">Today</Head>
            {checklist(false, go)}
          </GY>
        ),
      },
      {
        title: 'Done, with XP',
        note: 'Every completion counts toward a streak and a level. Next: projects.',
        scene: (go) => (
          <GY on="Today" hot="Projects" go={go}>
            <Toast>Done · Review pull request · +35 XP</Toast>
            {checklist(true)}
            <div className="dm-line">
              <Pill tone="violet">Streak: 6 days · level 13 · 1240 XP</Pill>
            </div>
          </GY>
        ),
      },
      {
        title: 'Projects',
        note: 'Bigger work lives in projects, each with its next step and its progress.',
        scene: (go) => (
          <GY on="Projects">
            <Head sub="Make room for what you want to build.">Projects</Head>
            <button type="button" className="dm-rowbtn dm-hot" onClick={go}>
              <Card>
                <div className="dm-line">
                  <span>
                    <b>Home gym build</b> <span className="dm-dim">health · project</span>
                  </span>
                  <Pill tone="info">Active</Pill>
                </div>
                <Bars rows={[['Next: Order rubber flooring · Nov 20, 2026', '60%', 60]]} />
              </Card>
            </button>
            <Card>
              <div className="dm-line">
                <span>
                  <b>Portfolio site</b> <span className="dm-dim">coding · project</span>
                </span>
                <Pill tone="info">Active</Pill>
              </div>
              <Bars rows={[['3 of 8 missions complete', '38%', 38]]} />
            </Card>
            <div className="dm-navy">
              <span>
                <b>Explore your Galaxy</b>See how your projects connect.
              </span>
              <span aria-hidden="true">›</span>
            </div>
          </GY>
        ),
      },
      {
        title: 'A project, broken into missions',
        note: 'Each mission has a priority and an XP reward. Next: health.',
        scene: (go) => (
          <GY on="Projects" hot="Health" go={go}>
            <Head sub="6 of 10 missions done · target Dec 15, 2026 · active.">Home gym build</Head>
            <Progress label="60% complete" />
            <Tabs seg items={['Overview', 'Tasks', 'Roadmap', 'Notes']} on={1} />
            <Row title="Order rubber flooring" meta="high · 35 XP" tick={false} />
            <Row title="Mount pull-up bar" meta="medium · 20 XP" tick />
          </GY>
        ),
      },
      {
        title: 'Health, today',
        note: 'Food, activity, water and weight on one screen. A missing value shows as a dash, never as zero.',
        scene: (go) => (
          <GY on="Health">
            <Tabs seg items={['Today', 'Workout', 'Nutrition', 'Coach']} on={0} />
            <Cols>
              <Card title="Calories today">
                <div className="dm-line">
                  <Ring pct={71} value="640" label="food budget left" />
                  <span>
                    <Kv k="Eaten" v="1,560" />
                    <span className="dm-dim">of 2,200 target</span>
                  </span>
                </div>
              </Card>
              <Card title="Protein · Water · Steps">
                <Bars
                  rows={[
                    ['Protein', '96 / 150 g', 64],
                    ['Water', '1.5 / 2.5 L', 60],
                    ['Steps', '7,420', 82],
                  ]}
                />
              </Card>
            </Cols>
            <Btn go={go} small>
              Coach
            </Btn>
          </GY>
        ),
      },
      {
        title: 'Ask the Health Coach',
        note: 'The coach can see your own food, activity, weight, plan and training.',
        scene: (go) => (
          <GY on="Health">
            <Head sub="Your nutrition & training assistant">Health Coach</Head>
            <b>What can I help with?</b>
            <Chips items={['Should I train today?', 'How has my training been?']} />
            <button type="button" className="dm-rowbtn dm-hot" onClick={go}>
              <Row title="How much protein do I have left?" />
            </button>
            <Field label="Ask the Health Coach" value="Ask about food, training or progress" />
          </GY>
        ),
      },
      {
        title: 'An answer from your own record',
        note: 'The reply uses the day’s real numbers. It is guidance, and says so.',
        scene: () => (
          <GY on="Health">
            <Head sub="Your nutrition & training assistant">Health Coach</Head>
            <Bubble me>How much protein do I have left?</Bubble>
            <Bubble>You have had 96 g of your 150 g target, so 54 g to go. A chicken and rice dinner from your foods would cover about 42 g of that.</Bubble>
            <Note>General guidance, not medical advice. Answers use only your Health data; replies can take a few seconds.</Note>
          </GY>
        ),
      },
    ],
  },
]
