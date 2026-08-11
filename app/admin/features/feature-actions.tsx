'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function FeatureActions({
  id,
  paymentStatus,
}: {
  id: number
  paymentStatus: 'unpaid' | 'paid'
}) {
  const [loading, setLoading] = useState<'markPaid' | 'approve' | 'reject' | null>(null)
  const [reference, setReference] = useState('')
  const [showRefInput, setShowRefInput] = useState(false)
  const router = useRouter()

  async function markPaid() {
    setLoading('markPaid')
    const res = await fetch(`/api/admin/features/${id}/mark-paid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_reference: reference || null }),
    })
    setLoading(null)
    if (res.ok) {
      router.refresh()
    } else {
      const { error } = await res.json().catch(() => ({ error: 'Something went wrong' }))
      alert(error)
    }
  }

  async function act(action: 'approve' | 'reject') {
    setLoading(action)
    const res = await fetch(`/api/admin/features/${id}/${action}`, { method: 'POST' })
    setLoading(null)
    if (res.ok) {
      router.refresh()
    } else {
      const { error } = await res.json().catch(() => ({ error: 'Something went wrong' }))
      alert(error)
    }
  }

  return (
    <div className="flex flex-col gap-2 shrink-0 items-end">
      {paymentStatus === 'unpaid' && (
        <>
          {showRefInput ? (
            <div className="flex flex-col gap-1 items-end">
              <input
                placeholder="Payment ref (optional)"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="text-sm border rounded px-2 py-1 w-40"
              />
              <button
                onClick={markPaid}
                disabled={loading !== null}
                className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm disabled:opacity-50"
              >
                {loading === 'markPaid' ? 'Saving...' : 'Confirm Paid'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowRefInput(true)}
              className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm"
            >
              Mark as Paid
            </button>
          )}
        </>
      )}

      <button
        onClick={() => act('approve')}
        disabled={loading !== null || paymentStatus !== 'paid'}
        title={paymentStatus !== 'paid' ? 'Payment must be confirmed first' : undefined}
        className="bg-green-600 text-white px-4 py-1.5 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading === 'approve' ? 'Approving...' : 'Approve'}
      </button>
      <button
        onClick={() => act('reject')}
        disabled={loading !== null}
        className="bg-red-600 text-white px-4 py-1.5 rounded text-sm disabled:opacity-50"
      >
        {loading === 'reject' ? 'Rejecting...' : 'Reject'}
      </button>
    </div>
  )
}