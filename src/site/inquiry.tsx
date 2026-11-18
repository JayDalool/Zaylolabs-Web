/**
 * Inquiry forms — the contact form and the request-access form.
 *
 * One component, two shapes:
 *   contact  what it is about (an app, custom work, or a general question), name, email, message
 *   access   name and email, for one named app
 *
 * Nothing is stored in the browser. A form is sent as JSON to the endpoint set at
 * build time in VITE_INQUIRY_ENDPOINT (see .env.example). That endpoint forwards
 * the inquiry to the studio's inbox; the inbox address is kept on the server and
 * never appears in this code or in the page. With no endpoint set, a form says
 * plainly that nothing was sent and asks the visitor to call — it never pretends
 * to have sent.
 *
 * What the endpoint receives (POST, application/json):
 *   { kind: 'contact' | 'access', about, name, email, message?, website }
 * `about` is 'general', 'custom' or a product slug. `website` is a hidden field that
 * people leave empty. The endpoint (server/inquiry.py) answers 2xx on success.
 */
import { useId, useState, type FormEvent } from 'react'
import { products, type Product } from '../data/products'

export const INQUIRY_ENDPOINT: string | null = import.meta.env.VITE_INQUIRY_ENDPOINT || null

type State = 'idle' | 'sending' | 'sent' | 'not-connected' | 'failed'

const TOPICS = [{ value: 'general', label: 'A general question' }, ...products.map((p) => ({ value: p.slug, label: p.name })), { value: 'custom', label: 'Custom software for my business' }]

async function send(data: Record<string, string>): Promise<State> {
  if (!INQUIRY_ENDPOINT) return 'not-connected'
  try {
    const r = await fetch(INQUIRY_ENDPOINT, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) })
    return r.ok ? 'sent' : 'failed'
  } catch {
    return 'failed'
  }
}

export function InquiryForm({ kind, product, about }: { kind: 'contact' | 'access'; product?: Product; /** contact form: the topic chosen to begin with */ about?: string }) {
  const id = useId()
  const [state, setState] = useState<State>('idle')
  const [email, setEmail] = useState('')

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>
    setEmail(data.email)
    setState('sending')
    setState(await send({ ...data, kind, ...(product ? { about: product.slug } : null) }))
  }

  if (state === 'sent')
    return (
      <p className="fm-done" role="status">
        <b>Thank you.</b> {kind === 'access' ? `Your request for ${product?.name} is in.` : 'Your message is in.'} We will be in contact at {email}.
      </p>
    )

  return (
    <form className="fm" onSubmit={submit} aria-label={kind === 'access' ? `Request access to ${product?.name}` : 'Contact ZayloLabs'}>
      {kind === 'contact' && (
        <div className="fm-field">
          <label htmlFor={`${id}-about`}>What is it about?</label>
          <select id={`${id}-about`} name="about" defaultValue={about ?? 'general'}>
            {TOPICS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="fm-row">
        <div className="fm-field">
          <label htmlFor={`${id}-name`}>Your name</label>
          <input id={`${id}-name`} name="name" type="text" autoComplete="name" required />
        </div>
        <div className="fm-field">
          <label htmlFor={`${id}-email`}>Your email</label>
          <input id={`${id}-email`} name="email" type="email" autoComplete="email" required />
        </div>
      </div>
      {kind === 'contact' && (
        <div className="fm-field">
          <label htmlFor={`${id}-message`}>Your question, or what you need</label>
          <textarea id={`${id}-message`} name="message" rows={4} required />
        </div>
      )}
      {/* Left empty by people; filled in by automated senders, which the endpoint then drops. */}
      <div className="fm-trap" aria-hidden="true">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="fm-foot">
        <button type="submit" className="sp-btn" disabled={state === 'sending'}>
          {state === 'sending' ? 'Sending…' : kind === 'access' ? 'Request access' : 'Send message'}
        </button>
        <p className="fm-note">{kind === 'access' ? 'We only use your name and email to reply about access.' : 'We only use these details to reply to you.'}</p>
      </div>
      <p className="fm-status" role="status" data-state={state === 'not-connected' || state === 'failed' ? state : undefined}>
        {state === 'not-connected' && (
          <>
            <b>Nothing was sent.</b> This form is not switched on yet. Please call us instead.
          </>
        )}
        {state === 'failed' && (
          <>
            <b>That did not go through.</b> Nothing was lost on your side. Please try again in a moment.
          </>
        )}
      </p>
    </form>
  )
}
