'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ClaimForm({
  business,
  userEmail,
}: {
  business: { id: number; name: string; city: string | null; state: string | null }
  userEmail: string
}) {
  const router = useRouter()
  const [form, setForm] = useState({
    full_name: '',
    email: userEmail,
    phone: '',
    relationship: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function updateField(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function submit(e: any) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/claims/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ business_id: business.id, ...form }),
    })

    const data = await res.json()
    setLoading(false)

    if (res.ok) {
      setSuccess(true)
      setTimeout(() => router.push(`/listings/${business.id}`), 1800)
    } else {
      setError(data.error || 'Something went wrong')
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Claim Submitted</h1>
        <p className="text-gray-600">We'll review your request and get back to you.</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Claim {business.name}</h1>
      <p className="text-sm text-gray-500 mb-6">
        {[business.city, business.state].filter(Boolean).join(', ')}
      </p>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}

      <form onSubmit={submit} className="space-y-4">
        <input
          name="full_name"
          placeholder="Your Full Name"
          className="w-full p-2 border rounded"
          onChange={updateField}
          value={form.full_name}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          onChange={updateField}
          value={form.email}
          required
        />
        <input
          name="phone"
          placeholder="Phone"
          className="w-full p-2 border rounded"
          onChange={updateField}
          value={form.phone}
        />
        <input
          name="relationship"
          placeholder="Your relationship to this business (e.g. Owner, Manager)"
          className="w-full p-2 border rounded"
          onChange={updateField}
          value={form.relationship}
        />
        <textarea
          name="message"
          placeholder="Anything else we should know?"
          className="w-full p-2 border rounded"
          onChange={updateField}
          value={form.message}
          rows={4}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white p-3 rounded disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Claim'}
        </button>
      </form>
    </div>
  )
}