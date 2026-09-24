'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Form({
  topic,
  slug,
  surfaceSource,
}: {
  topic: string
  slug: string
  surfaceSource: string
}) {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const isEmail = contact.includes('@')
    const { error: insertError } = await supabase
      .from('form_submissions')
      .insert({
        name,
        contact_method: isEmail ? 'email' : 'phone',
        contact_value: contact,
        topic,
        slug,
        surface_source: surfaceSource,
      })

    setSubmitting(false)

    if (insertError) {
      setError('Something went wrong. Please try again.')
      return
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="rounded-card border border-border bg-surface p-6 flex flex-col gap-2">
        <p className="font-serif text-xl text-confirm">Thank you.</p>
        <p className="text-sm text-text-secondary">
          Someone will reach out within 24 hours.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-card border border-border bg-surface p-6 flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <p className="font-serif text-xl text-text-primary">
          Want someone to reach out?
        </p>
        <p className="text-sm text-text-secondary">
          No obligation. Just a conversation.
        </p>
      </div>

      <input
        type="text"
        placeholder="Your first name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="rounded-control border border-border bg-background px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition"
      />

      <input
        type="text"
        placeholder="Phone or email"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        required
        className="rounded-control border border-border bg-background px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition"
      />

      <button
        type="submit"
        disabled={submitting}
        className="rounded-control bg-accent px-4 py-3 text-sm text-white transition hover:bg-accent-hover disabled:opacity-50"
      >
        {submitting ? 'Sending…' : 'Send'}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <p className="text-xs text-text-secondary">
        We&apos;ll only contact you about what you watched.
      </p>
    </form>
  )
}