'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import {
  Star,
  CheckCircle,
  Clock,
  ShieldCheck,
  Send,
} from 'lucide-react'

interface FeatureRequestFormProps {
  business: {
    id: number
    name: string
  }
}

const FEATURE_PRICE = 49
const FEATURE_DAYS = 30

export default function FeatureRequestForm({
  business,
}: FeatureRequestFormProps) {
  const router = useRouter()

  const [message, setMessage] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  const [success, setSuccess] =
    useState(false)

  async function submit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()

    if (loading) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(
        `/api/listings/${business.id}/feature-request`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            message: message.trim(),
          }),
        }
      )

      const data =
        await res.json()

      if (!res.ok) {
        setError(
          data.error ||
            'We could not submit your feature request.'
        )

        return
      }

      setSuccess(true)

      // Refresh server-rendered data so the parent
      // page can recognise the pending request.
      router.refresh()
    } catch (err) {
      console.error(
        'Feature request error:',
        err
      )

      setError(
        'We could not submit your feature request. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white border rounded-2xl p-8 shadow-sm text-center">

        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle
            size={30}
            className="text-green-700"
          />
        </div>

        <h2 className="text-2xl font-bold text-gray-900">
          Feature Request Submitted
        </h2>

        <p className="text-gray-600 mt-3 max-w-lg mx-auto leading-relaxed">
          Your request to feature{' '}
          <strong>{business.name}</strong>{' '}
          has been received.
        </p>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mt-6 text-left">

          <div className="flex items-start gap-3">

            <Clock
              size={19}
              className="text-blue-700 mt-0.5 shrink-0"
            />

            <div>
              <h3 className="font-semibold text-gray-900">
                What happens next?
              </h3>

              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                The request will remain pending
                until the required review and
                payment steps have been completed.
                Featured placement begins only
                after activation.
              </p>
            </div>

          </div>

        </div>

        <button
          type="button"
          onClick={() =>
            router.push('/my-listings')
          }
          className="mt-7 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Back to My Listings
        </button>

      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* PACKAGE */}

      <section className="bg-white border rounded-2xl overflow-hidden shadow-sm">

        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-100 p-6">

          <div className="flex items-start justify-between gap-4">

            <div>

              <div className="inline-flex items-center gap-2 text-amber-800 font-semibold text-sm mb-3">

                <Star
                  size={17}
                  className="fill-current"
                />

                Featured Placement

              </div>

              <h2 className="text-2xl font-bold text-gray-900">
                30-Day Featured Listing
              </h2>

              <p className="text-gray-600 mt-2">
                Give {business.name} more prominent
                placement within supported directory
                pages.
              </p>

            </div>

            <div className="text-right shrink-0">

              <div className="text-3xl font-bold text-green-700">
                ${FEATURE_PRICE}
              </div>

              <div className="text-sm text-gray-500">
                {FEATURE_DAYS} days
              </div>

            </div>

          </div>

        </div>

        {/* BENEFITS */}

        <div className="p-6">

          <h3 className="font-bold text-lg mb-4">
            Included
          </h3>

          <div className="space-y-4">

            <div className="flex items-start gap-3">

              <CheckCircle
                size={19}
                className="text-green-600 mt-0.5 shrink-0"
              />

              <div>
                <p className="font-medium text-gray-900">
                  Priority placement
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  Featured listings can appear ahead
                  of standard listings on supported
                  location and service pages.
                </p>
              </div>

            </div>

            <div className="flex items-start gap-3">

              <CheckCircle
                size={19}
                className="text-green-600 mt-0.5 shrink-0"
              />

              <div>
                <p className="font-medium text-gray-900">
                  Featured badge
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  Your listing is visually identified
                  as featured while the placement is
                  active.
                </p>
              </div>

            </div>

            <div className="flex items-start gap-3">

              <CheckCircle
                size={19}
                className="text-green-600 mt-0.5 shrink-0"
              />

              <div>
                <p className="font-medium text-gray-900">
                  30-day placement period
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  The featured period runs for
                  {` ${FEATURE_DAYS} days `}
                  after activation.
                </p>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* IMPORTANT NOTICE */}

      <section className="bg-blue-50 border border-blue-100 rounded-xl p-5">

        <div className="flex items-start gap-3">

          <ShieldCheck
            size={20}
            className="text-blue-700 mt-0.5 shrink-0"
          />

          <div>

            <h3 className="font-semibold text-gray-900">
              About featured placement
            </h3>

            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              Featured placement is designed to
              increase visibility within Lawn Mowing
              Near Me. It does not guarantee a
              particular number of views, clicks,
              enquiries, customers, search rankings,
              or sales.
            </p>

          </div>

        </div>

      </section>

      {/* REQUEST FORM */}

      <section className="bg-white border rounded-2xl p-6 md:p-8 shadow-sm">

        <h2 className="text-xl font-bold text-gray-900">
          Request Featured Placement
        </h2>

        <p className="text-sm text-gray-600 mt-2 mb-6">
          Submit the request below. Payment and
          activation details can be provided after
          the request is reviewed.
        </p>

        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form
          onSubmit={submit}
          className="space-y-5"
        >

          <div>

            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-900 mb-2"
            >
              Additional information
              <span className="text-gray-400 font-normal">
                {' '}
                (optional)
              </span>
            </label>

            <textarea
              id="message"
              name="message"
              placeholder="Anything you'd like us to know about your request?"
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              rows={4}
              maxLength={1000}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
            />

            <div className="text-xs text-gray-400 text-right mt-1">
              {message.length}/1000
            </div>

          </div>

          {/* SUMMARY */}

          <div className="bg-gray-50 border rounded-xl p-4">

            <div className="flex justify-between gap-4 text-sm mb-2">

              <span className="text-gray-600">
                Featured duration
              </span>

              <span className="font-medium">
                {FEATURE_DAYS} days
              </span>

            </div>

            <div className="flex justify-between gap-4 text-sm">

              <span className="text-gray-600">
                Price
              </span>

              <span className="font-bold text-gray-900">
                ${FEATURE_PRICE}.00
              </span>

            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-green-600 text-white p-3.5 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >

            <Send size={17} />

            {loading
              ? 'Submitting Request...'
              : `Request Featured Placement — $${FEATURE_PRICE}`}

          </button>

          <p className="text-xs text-gray-500 text-center leading-relaxed">
            Submitting this form creates a feature
            request. Featured placement is not
            activated until the required review and
            payment steps are complete.
          </p>

        </form>

      </section>

    </div>
  )
}