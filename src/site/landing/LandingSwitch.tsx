/** Review-only control for comparing the two landing versions. Remove once one is chosen. */
export type LandingKey = 'a' | 'b'

export function LandingSwitch({ value, onChange }: { value: LandingKey; onChange: (v: LandingKey) => void }) {
  return (
    <div className="landing-switch" role="group" aria-label="Landing version (review only)">
      <span>Landing</span>
      <button type="button" aria-pressed={value === 'a'} onClick={() => onChange('a')}>
        A · Showpiece
      </button>
      <button type="button" aria-pressed={value === 'b'} onClick={() => onChange('b')}>
        B · Simple
      </button>
    </div>
  )
}
