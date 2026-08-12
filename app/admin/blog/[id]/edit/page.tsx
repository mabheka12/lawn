// app/admin/blog/[id]/edit/page.tsx
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import BlogPostForm from '@/components/admin/BlogPostForm'

interface EditBlogPostPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
    const { id } = await params
  
  // Fetch post data - using snake_case column names
  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !post) {
    notFound()
  }

  // Transform for the form (camelCase)
  const transformedPost = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    featuredImage: post.featured_image,
    publishedAt: post.published_at,
    updatedAt: post.updated_at,
    tags: post.tags || [],
    author: post.author,
    city: post.city,
    state: post.state,
    published: post.published,
    createdAt: post.created_at,
    featured_image: post.featured_image,
    published_at: post.published_at,
    updated_at: post.updated_at,
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Edit Blog Post
      </h1>
      <BlogPostForm post={transformedPost} />
    </div>
  )
}

