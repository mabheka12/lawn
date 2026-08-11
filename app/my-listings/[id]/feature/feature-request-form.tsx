'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function FeatureRequestForm({ business }: { business: { id: number; name: string } }) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function submit(e: any) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch(`/api/listings/${business.id}/feature-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })

    const data = await res.json()
    setLoading(false)

    if (res.ok) {
      setSuccess(true)
    } else {
      setError(data.error || 'Something went wrong')
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Request Submitted</h1>
        <p className="text-gray-600 mb-2">
          We'll be in touch with payment instructions to activate your featured spot.
        </p>
        <p className="text-sm text-gray-400">You can check status anytime from My Listings.</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Feature {business.name}</h1>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-green-700">$49</span>
          <span className="text-gray-600">/ 30 days</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Your listing appears in the homepage spotlight for 30 days.
        </p>
      </div>

      <p className="text-sm text-gray-500 mb-6">
        Submit your request below. We'll reach out with payment instructions — your
        spot goes live once payment is confirmed.
      </p>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}

      <form onSubmit={submit} className="space-y-4">
        <textarea
          placeholder="Anything you'd like us to know? (optional)"
          className="w-full p-2 border rounded"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white p-3 rounded disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Request to be Featured — $49/30 days'}
        </button>
      </form>
    </div>
  )
}