import type { ReactNode } from 'react'
import type { Go } from './kit'

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
