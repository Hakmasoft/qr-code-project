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
      <div className="p-4 border border-gray-200 rounded-lg">
        <p className="text-base mb-1">Thank you.</p>
        <p className="text-sm text-gray-500">
          Someone will reach out within 24 hours.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border border-gray-200 rounded-lg flex flex-col gap-3"
    >
      <p className="text-base">Want someone to reach out?</p>

      <input
        type="text"
        placeholder="Your first name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="border border-gray-300 rounded px-3 py-2 text-sm"
      />

      <input
        type="text"
        placeholder="Phone or email"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        required
        className="border border-gray-300 rounded px-3 py-2 text-sm"
      />

      <button
        type="submit"
        disabled={submitting}
        className="bg-gray-900 text-white rounded px-3 py-2 text-sm disabled:opacity-50"
      >
        {submitting ? 'Sending...' : 'Send'}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <p className="text-xs text-gray-400">
        No obligation. We&apos;ll only contact you about what you watched.
      </p>
    </form>
  )
}