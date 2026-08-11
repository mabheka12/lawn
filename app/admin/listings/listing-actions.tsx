'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ListingActions({ id }: { id: number }) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const router = useRouter()

  async function act(action: 'approve' | 'reject') {
    setLoading(action)
    const res = await fetch(`/api/admin/listings/${id}/${action}`, { method: 'POST' })
    setLoading(null)

    if (res.ok) {
      router.refresh()
    } else {
      const { error } = await res.json().catch(() => ({ error: 'Something went wrong' }))
      alert(error)
    }
  }

  return (
    <div className="flex flex-col gap-2 shrink-0">
      <button
        onClick={() => act('approve')}
        disabled={loading !== null}
        className="bg-green-600 text-white px-4 py-1.5 rounded text-sm disabled:opacity-50"
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