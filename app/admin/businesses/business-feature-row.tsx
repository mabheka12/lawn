'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BusinessFeatureRow({
  business,
}: {
  business: { id: number; name: string; city: string | null; state: string | null; featured_until: string | null }
}) {
  const router = useRouter()
  const [days, setDays] = useState('30')
  const [loading, setLoading] = useState(false)

  const isFeatured = business.featured_until && new Date(business.featured_until) > new Date()

  async function feature() {
    setLoading(true)
    const res = await fetch(`/api/admin/businesses/${business.id}/feature`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days: Number(days) }),
    })
    setLoading(false)
    if (res.ok) router.refresh()
    else alert('Failed to feature listing')
  }

  async function unfeature() {
    setLoading(true)
    const res = await fetch(`/api/admin/businesses/${business.id}/unfeature`, { method: 'POST' })
    setLoading(false)
    if (res.ok) router.refresh()
    else alert('Failed to remove feature')
  }

  return (
    <div className="border rounded p-3 flex items-center justify-between gap-4">
      <div>
        <p className="font-medium">{business.name}</p>
        <p className="text-sm text-gray-500">
          {[business.city, business.state].filter(Boolean).join(', ')}
        </p>
        {isFeatured && (
          <p className="text-xs text-green-700 mt-1">
            Featured until {new Date(business.featured_until!).toLocaleDateString()}
          </p>
        )}
      </div>

      {isFeatured ? (
        <button
          onClick={unfeature}
          disabled={loading}
          className="text-sm bg-gray-200 px-3 py-1.5 rounded disabled:opacity-50 shrink-0"
        >
          Remove Feature
        </button>
      ) : (
        <div className="flex items-center gap-2 shrink-0">
          <select value={days} onChange={(e) => setDays(e.target.value)} className="p-1.5 border rounded text-sm">
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
          </select>
          <button
            onClick={feature}
            disabled={loading}
            className="text-sm bg-green-600 text-white px-3 py-1.5 rounded disabled:opacity-50"
          >
            {loading ? '...' : 'Feature'}
          </button>
        </div>
      )}
    </div>
  )
}