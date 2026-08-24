'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import {
  CheckCircle,
  CreditCard,
  Star,
  XCircle,
  X,
} from 'lucide-react'

interface FeatureActionsProps {
  id: number

  paymentStatus:
    | 'unpaid'
    | 'paid'
}

type LoadingAction =
  | 'markPaid'
  | 'approve'
  | 'reject'
  | null

export default function FeatureActions({
  id,
  paymentStatus,
}: FeatureActionsProps) {
  const router =
    useRouter()

  const [
    loading,
    setLoading,
  ] =
    useState<LoadingAction>(
      null
    )

  const [
    reference,
    setReference,
  ] =
    useState('')

  const [
    showRefInput,
    setShowRefInput,
  ] =
    useState(false)

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null)

  // ---------------------------------------
  // API ERROR HELPER
  // ---------------------------------------

  async function getErrorMessage(
    res: Response
  ) {
    try {
      const data =
        await res.json()

      return (
        data.error ||
        'Something went wrong.'
      )
    } catch {
      return (
        'Something went wrong.'
      )
    }
  }

  // ---------------------------------------
  // MARK PAYMENT AS PAID
  // ---------------------------------------

  async function markPaid() {
    if (loading) {
      return
    }

    setLoading(
      'markPaid'
    )

    setError(null)

    try {
      const res =
        await fetch(
          `/api/admin/features/${id}/mark-paid`,
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                payment_reference:
                  reference.trim() ||
                  null,
              }),
          }
        )

      if (!res.ok) {
        setError(
          await getErrorMessage(
            res
          )
        )

        return
      }

      setReference('')
      setShowRefInput(
        false
      )

      router.refresh()
    } catch (err) {
      console.error(
        'Mark feature payment error:',
        err
      )

      setError(
        'Could not update the payment status.'
      )
    } finally {
      setLoading(null)
    }
  }

  // ---------------------------------------
  // ACTIVATE FEATURED PLACEMENT
  // ---------------------------------------

  async function approve() {
    if (
      loading ||
      paymentStatus !==
        'paid'
    ) {
      return
    }

    const confirmed =
      window.confirm(
        'Activate featured placement for this business?'
      )

    if (!confirmed) {
      return
    }

    setLoading(
      'approve'
    )

    setError(null)

    try {
      const res =
        await fetch(
          `/api/admin/features/${id}/approve`,
          {
            method:
              'POST',
          }
        )

      if (!res.ok) {
        setError(
          await getErrorMessage(
            res
          )
        )

        return
      }

      router.refresh()
    } catch (err) {
      console.error(
        'Feature activation error:',
        err
      )

      setError(
        'Could not activate featured placement.'
      )
    } finally {
      setLoading(null)
    }
  }

  // ---------------------------------------
  // REJECT REQUEST
  // ---------------------------------------

  async function reject() {
    if (loading) {
      return
    }

    const confirmed =
      window.confirm(
        'Reject this featured-placement request?'
      )

    if (!confirmed) {
      return
    }

    setLoading(
      'reject'
    )

    setError(null)

    try {
      const res =
        await fetch(
          `/api/admin/features/${id}/reject`,
          {
            method:
              'POST',
          }
        )

      if (!res.ok) {
        setError(
          await getErrorMessage(
            res
          )
        )

        return
      }

      router.refresh()
    } catch (err) {
      console.error(
        'Feature rejection error:',
        err
      )

      setError(
        'Could not reject the feature request.'
      )
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="w-full space-y-3">

      {/* ERROR */}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {/* -------------------------------- */}
      {/* PAYMENT */}
      {/* -------------------------------- */}

      {paymentStatus ===
        'unpaid' && (

        <div className="border rounded-xl p-4 bg-gray-50">

          <div className="flex items-center gap-2 mb-3">

            <CreditCard
              size={17}
              className="text-gray-600"
            />

            <span className="text-sm font-semibold text-gray-900">
              Payment
            </span>

          </div>

          {!showRefInput ? (

            <button
              type="button"
              onClick={() => {
                setError(
                  null
                )

                setShowRefInput(
                  true
                )
              }}
              disabled={
                loading !==
                null
              }
              className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              Mark as Paid
            </button>

          ) : (

            <div className="space-y-3">

              <div>

                <label
                  htmlFor={`payment-reference-${id}`}
                  className="block text-xs font-medium text-gray-600 mb-1.5"
                >
                  Payment Reference
                  <span className="font-normal text-gray-400">
                    {' '}
                    (optional)
                  </span>
                </label>

                <input
                  id={`payment-reference-${id}`}
                  type="text"
                  value={
                    reference
                  }
                  onChange={(
                    e
                  ) =>
                    setReference(
                      e.target
                        .value
                    )
                  }
                  placeholder="Transaction or payment reference"
                  maxLength={
                    200
                  }
                  disabled={
                    loading !==
                    null
                  }
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />

              </div>

              <div className="flex gap-2">

                <button
                  type="button"
                  onClick={
                    markPaid
                  }
                  disabled={
                    loading !==
                    null
                  }
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <CheckCircle
                    size={
                      15
                    }
                  />

                  {loading ===
                  'markPaid'
                    ? 'Saving...'
                    : 'Confirm Paid'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReference(
                      ''
                    )

                    setShowRefInput(
                      false
                    )
                  }}
                  disabled={
                    loading !==
                    null
                  }
                  aria-label="Cancel payment update"
                  className="border border-gray-300 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                >
                  <X
                    size={
                      16
                    }
                  />
                </button>

              </div>

            </div>

          )}

        </div>

      )}

      {/* -------------------------------- */}
      {/* PAID */}
      {/* -------------------------------- */}

      {paymentStatus ===
        'paid' && (

        <div className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-800 p-3 rounded-lg text-sm">

          <CheckCircle
            size={17}
          />

          Payment confirmed

        </div>

      )}

      {/* -------------------------------- */}
      {/* ACTIVATE */}
      {/* -------------------------------- */}

      <button
        type="button"
        onClick={
          approve
        }
        disabled={
          loading !==
            null ||
          paymentStatus !==
            'paid'
        }
        title={
          paymentStatus !==
          'paid'
            ? 'Payment must be confirmed before activation'
            : undefined
        }
        className="w-full inline-flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Star
          size={16}
        />

        {loading ===
        'approve'
          ? 'Activating...'
          : 'Activate Featured Placement'}
      </button>

      {/* -------------------------------- */}
      {/* REJECT */}
      {/* -------------------------------- */}

      <button
        type="button"
        onClick={
          reject
        }
        disabled={
          loading !==
          null
        }
        className="w-full inline-flex items-center justify-center gap-2 border border-red-300 text-red-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-50 transition disabled:opacity-50"
      >
        <XCircle
          size={16}
        />

        {loading ===
        'reject'
          ? 'Rejecting...'
          : 'Reject Request'}
      </button>

    </div>
  )
}