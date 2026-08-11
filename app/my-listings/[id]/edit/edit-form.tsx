'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EditForm({ business }: { business: any }) {
  const router = useRouter()
  const [form, setForm] = useState({
    address: business.address ?? '',
    phone: business.phone ?? '',
    website: business.website ?? '',
    category: business.category ?? '',
    primary_category: business.primary_category ?? '',
    city: business.city ?? '',
    state: business.state ?? '',
    country: business.country ?? '',
    description: business.description ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  function updateField(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function submit(e: any) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const res = await fetch(`/api/listings/${business.id}/edit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    setLoading(false)

    if (res.ok) {
      setMessage('Changes submitted for review.')
      setTimeout(() => router.push('/my-listings'), 1500)
    } else {
      setMessage(data.error || 'Something went wrong')
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Edit {business.name}</h1>
      <p className="text-sm text-gray-500 mb-6">
        Changes are reviewed by an admin before going live. Name and slug can't be changed here.
      </p>

      {message && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded text-sm">{message}</div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <input name="address" placeholder="Address" className="w-full p-2 border rounded" onChange={updateField} value={form.address} />
        <input name="phone" placeholder="Phone" className="w-full p-2 border rounded" onChange={updateField} value={form.phone} />
        <input name="website" placeholder="Website" className="w-full p-2 border rounded" onChange={updateField} value={form.website} />
        <input name="category" placeholder="Category" className="w-full p-2 border rounded" onChange={updateField} value={form.category} />
        <input name="primary_category" placeholder="Primary Category" className="w-full p-2 border rounded" onChange={updateField} value={form.primary_category} />
        <input name="city" placeholder="City" className="w-full p-2 border rounded" onChange={updateField} value={form.city} />
        <input name="state" placeholder="State" className="w-full p-2 border rounded" onChange={updateField} value={form.state} />
        <input name="country" placeholder="Country" className="w-full p-2 border rounded" onChange={updateField} value={form.country} />
        <textarea name="description" placeholder="Description" className="w-full p-2 border rounded" onChange={updateField} value={form.description} rows={5} />

        <button type="submit" disabled={loading} className="w-full bg-green-600 text-white p-3 rounded disabled:opacity-50">
          {loading ? 'Submitting...' : 'Submit for Review'}
        </button>
      </form>
    </div>
  )
}