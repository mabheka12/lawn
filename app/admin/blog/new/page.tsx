// app/admin/blog/new/page.tsx
import BlogPostForm from '@/components/admin/BlogPostForm'

export const metadata = {
  title: 'Create New Blog Post | Admin',
}

export default function NewBlogPostPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Create New Blog Post
      </h1>
      <BlogPostForm />
    </div>
  )
}