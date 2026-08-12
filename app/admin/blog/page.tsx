// app/admin/blog/page.tsx - Remove "use client" directive
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { deleteBlogPost } from '@/lib/actions/blog'

// Metadata can only be exported from Server Components
export const metadata = {
  title: 'Manage Blog Posts | Admin',
}

export default async function AdminBlogPage() {
  try {
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, published, published_at, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching posts:', error)
      return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <h2 className="font-semibold">Error loading posts</h2>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        </div>
      )
    }

    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Blog Posts</h1>
          <Link
            href="/admin/blog/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + New Post
          </Link>
        </div>

        {!posts || posts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-600">No blog posts yet.</p>
            <Link
              href="/admin/blog/new"
              className="mt-4 inline-block text-blue-600 hover:text-blue-800"
            >
              Create your first post →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {post.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          /blog/{post.slug}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          post.published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {post.published_at 
                          ? new Date(post.published_at).toLocaleDateString()
                          : 'Not published'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/blog/${post.id}/edit`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          View
                        </Link>
                        {/* Use Server Action directly without onClick */}
                        <form action={deleteBlogPost.bind(null, post.id)} className="inline">
                          <button
                            type="submit"
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <h2 className="font-semibold">Something went wrong</h2>
          <p className="text-sm mt-1">Please try again later.</p>
        </div>
      </div>
    )
  }
}