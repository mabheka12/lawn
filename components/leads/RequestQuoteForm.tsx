'use client'

import { useState } from 'react'
import {
  CheckCircle,
  Send,
} from 'lucide-react'
import {
  trackQuoteSubmitted,
} from '@/lib/analytics'

interface RequestQuoteFormProps {
  city?: string
  state?: string
  country?: string
  service?: string
  businessId?: number
  businessName?: string
  sourcePage?: string
  title?: string
}

const SERVICES = [
  'Lawn Care',
  'Landscaping',
  'Garden Design',
  'Tree Services',
  'Hardscaping',
  'Turf Installation',
  'Gardener',
  'Lawn Mower Repair',
]

export default function RequestQuoteForm({
  city = '',
  state = '',
  country = '',
  service = '',
  businessId,
  businessName,
  sourcePage,
}: RequestQuoteFormProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    service,
    city,
    state,
    country,
    message: '',
  })

  const [loading, setLoading] =
    useState(false)

  const [success, setSuccess] =
    useState(false)

  const [error, setError] =
    useState('')

  function updateField(
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) {
    const { name, value } = e.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          ...form,

          business_id:
            businessId ?? null,

          source_page:
            sourcePage ??
            window.location.pathname,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(
          data.error ||
            'We could not submit your request.'
        )

        return
      }

      trackQuoteSubmitted({
        service: form.service,
        city: form.city,
        state: form.state,
        country: form.country,
        business_id: businessId,
        source_page:
          sourcePage ||
          window.location.pathname,
      })

      setSuccess(true)

      setForm((current) => ({
        ...current,
        name: '',
        email: '',
        phone: '',
        message: '',
      }))
    } catch {
      setError(
        'We could not submit your request. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">

        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle
            size={28}
            className="text-green-700"
          />
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Request Received
        </h3>

        <p className="text-gray-600">
          Thank you. Your enquiry has been
          submitted.
        </p>

      </div>
    )
  }

  return (
    <div className="bg-white border rounded-2xl shadow-sm p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          {businessName
            ? `Contact ${businessName}`
            : 'Request a Quote'}
        </h2>
        <p className="text-gray-600 mt-2 text-sm leading-relaxed">
          Tell us what service you are looking
          for and provide your contact details.
        </p>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-5 text-sm">
          {error}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* SERVICE */}
        <div>
          <label
            htmlFor="service"
            className="block text-sm font-medium mb-1.5"
          >
            Service Needed *
          </label>
          <select
            id="service"
            name="service"
            value={form.service}
            onChange={updateField}
            required
            className="w-full border rounded-lg p-3 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">
              Select a service
            </option>
            {SERVICES.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>
        </div>
        {/* LOCATION */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium mb-1.5"
            >
              City *
            </label>
            <input
              id="city"
              name="city"
              value={form.city}
              onChange={updateField}
              required
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label
              htmlFor="state"
              className="block text-sm font-medium mb-1.5"
            >
              State / Region
            </label>
            <input
              id="state"
              name="state"
              value={form.state}
              onChange={updateField}
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
        {/* NAME */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium mb-1.5"
          >
            Your Name *
          </label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={updateField}
            required
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        {/* EMAIL + PHONE */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-1.5"
            >
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              required
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium mb-1.5"
            >
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={updateField}
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
        {/* MESSAGE */}
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium mb-1.5"
          >
            Tell us what you need
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            value={form.message}
            onChange={updateField}
            placeholder="Describe the work you need done..."
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white rounded-lg p-3.5 font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Send size={17} />
          {loading
            ? 'Submitting...'
            : 'Request Quote'}
        </button>
        <p className="text-xs text-gray-500 leading-relaxed text-center">
          Your information will be used to
          process your enquiry.
        </p>
      </form>
    </div>
  )
}