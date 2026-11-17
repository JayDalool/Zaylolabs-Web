/**
 * Demo scripts — one redrawn walkthrough per app (and extra short ones for an
 * app's other tools). The first demo in each list is the main one.
 *
 * Every step follows the app's real screens: the headings, labels, buttons and
 * the order of the steps were taken from each app's code (research of
 * 16–17 Nov 2026). The data is made up. A demo must never show something the
 * app does not do — if an app changes, change its script here.
 *
 * To add a demo: append to the product's list in apps/<slug>.tsx. A step is a
 * title, one line of explanation, and a scene built from the kit; give a
 * control `go` to make it the highlighted next action, or set `auto` (ms) for
 * a step that moves on by itself.
 */
import { commandcenter } from './apps/commandcenter'
import { gyst } from './apps/gyst'
import { myexpenses } from './apps/myexpenses'
import { estatelab } from './apps/estatelab'
import type { Demo } from './types'

export type { Demo, DemoStep } from './types'

export const demos: Record<string, Demo[]> = { estatelab, myexpenses, commandcenter, gyst }
