'use client'

import { useState } from 'react'

export default function SubmitPage() {
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    website: '',
    rating: '',
    category: '',
    city: '',
    state: '',
    country: '',
    description: '',
    listing_type: 'mowing',
    primary_category: '',
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function updateField(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function submit(e: any) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/listings/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    setLoading(false)

    if (res.ok) {
      setSuccess(true)
      setForm({
        name: '',
        address: '',
        phone: '',
        website: '',
        rating: '',
        category: '',
        city: '',
        state: '',
        country: '',
        description: '',
        listing_type: 'mowing',
        primary_category: '',
      })
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Submit a Business Listing
      </h1>

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          Listing submitted for review ✔
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">

        <input
          name="name"
          placeholder="Business Name"
          className="w-full p-2 border rounded"
          onChange={updateField}
          value={form.name}
          required
        />

        <input
          name="address"
          placeholder="Address"
          className="w-full p-2 border rounded"
          onChange={updateField}
          value={form.address}
        />

        <input
          name="phone"
          placeholder="Phone"
          className="w-full p-2 border rounded"
          onChange={updateField}
          value={form.phone}
        />

        <input
          name="website"
          placeholder="Website"
          className="w-full p-2 border rounded"
          onChange={updateField}
          value={form.website}
        />

        <input
          name="city"
          placeholder="City"
          className="w-full p-2 border rounded"
          onChange={updateField}
          value={form.city}
        />

        <input
          name="state"
          placeholder="State"
          className="w-full p-2 border rounded"
          onChange={updateField}
          value={form.state}
        />

        <input
          name="country"
          placeholder="Country"
          className="w-full p-2 border rounded"
          onChange={updateField}
          value={form.country}
        />

        <textarea
          name="description"
          placeholder="Description"
          className="w-full p-2 border rounded"
          onChange={updateField}
          value={form.description}
        />

        {/* listing type */}
        <select
          name="listing_type"
          className="w-full p-2 border rounded"
          onChange={updateField}
          value={form.listing_type}
        >
          <option value="mowing">Lawn Care</option>
          <option value="repairs">Repairs</option>
        </select>

        <input
          name="primary_category"
          placeholder="Primary Category"
          className="w-full p-2 border rounded"
          onChange={updateField}
          value={form.primary_category}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white p-3 rounded"
        >
          {loading ? 'Submitting...' : 'Submit Listing'}
        </button>
      </form>
    </div>
  )
}