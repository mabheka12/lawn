'use client'

import { createClient } from '@/utils/supabase/client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginContent() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  async function signInWithGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-sm w-full p-8 bg-white border rounded-lg text-center">
        <h1 className="text-xl font-bold mb-6">Sign in</h1>
        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-2 border rounded p-3 hover:bg-gray-50"
        >
          Continue with Google
        </button>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  )
}