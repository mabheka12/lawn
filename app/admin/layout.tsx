import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') redirect('/')

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-6">
          <span className="font-bold text-lg">Admin</span>
          <Link href="/admin" className="text-sm text-gray-600 hover:text-black">
            Dashboard
          </Link>
          <Link href="/admin/listings" className="text-sm text-gray-600 hover:text-black">
            Listings
          </Link>
          <Link href="/admin/claims" className="text-sm text-gray-600 hover:text-black">
            Claims
          </Link>
          <Link href="/admin/edits" className="text-sm text-gray-600 hover:text-black">
            Edits
          </Link>
          <Link href="/admin/features" className="text-sm text-gray-600 hover:text-black">
            Feature Requests
          </Link>
          <Link href="/admin/businesses" className="text-sm text-gray-600 hover:text-black">
            Manage Featured
          </Link>
          <Link href="/admin/leads" className="text-sm text-gray-600 hover:text-black">
            Leads
          </Link>
          <Link href="/admin/blog" className="text-sm text-gray-600 hover:text-black">
            Blog
          </Link>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}