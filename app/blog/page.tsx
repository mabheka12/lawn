// app/blog/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getPublishedPosts } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Lawn Blog - Tips, Guides, and Advice',
  description: 'Read expert articles on lawn care, maintenance, and tips. Stay informed with the latest lawn care advice and industry insights.',
  keywords: ['lawn blog', 'lawn care tips', 'lawn maintenance', 'lawn care advice'],
  openGraph: {
    title: 'Lawn Blog - Tips, Guides, and Advice',
    description: 'Read expert articles on lawn care, maintenance, and tips.',
    type: 'website',
    url: '/blog',
  },
}

export default async function BlogPage() {
  const posts = await getPublishedPosts()

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-8" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/" className="hover:text-blue-600 transition">
              Home
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-800 font-medium">Blog</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Lawn Blog & Tips
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl">
          Expert advice on lawn care, maintenance, and everything you need to know about keeping your lawn in top condition.
        </p>
      </div>

      {/* Blog Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <p className="text-gray-600 text-lg">No blog posts found.</p>
          <p className="text-gray-500 mt-2">Check back later for new articles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article key={post.id} className="group">
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="relative h-52 bg-gray-100">
                    {post.featuredImage ? (
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <span className="text-5xl">🌿</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5">
                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {post.tags.slice(0, 2).map((tag: string) => (
                          <span 
                            key={tag} 
                            className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                        {post.tags.length > 2 && (
                          <span className="text-xs text-gray-400 self-center">
                            +{post.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    
                    {post.excerpt && (
                      <p className="text-gray-600 text-sm mt-2 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}