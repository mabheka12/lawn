// lib/actions/blog.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import slugify from 'slugify'
//import { BlogPostInput } from '@/lib/types'

export async function createBlogPost(formData: FormData) {
  const rawData = {
    title: formData.get('title') as string,
    excerpt: formData.get('excerpt') as string || null,
    content: formData.get('content') as string || null,
    featured_image: formData.get('featuredImage') as string || null,
    tags: JSON.parse(formData.get('tags') as string || '[]'),
    author: formData.get('author') as string || null,
    city: formData.get('city') as string || null,
    state: formData.get('state') as string || null,
    published: formData.get('published') === 'true',
    published_at: formData.get('publishedAt') as string || new Date().toISOString(),
  }

  // Generate slug from title if not provided
  let slug = formData.get('slug') as string
  if (!slug) {
    slug = slugify(rawData.title, { lower: true, strict: true })
  }

  // Check if slug already exists
  const { data: existingPost } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('slug', slug)
    .single()

  if (existingPost) {
    throw new Error('A post with this slug already exists. Please use a different title or custom slug.')
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .insert([
      {
        ...rawData,
        slug,
        published_at: rawData.published ? rawData.published_at : null,
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating blog post:', error)
    throw new Error('Failed to create blog post')
  }

  revalidatePath('/blog')
  revalidatePath('/admin/blog')
  redirect(`/admin/blog/${data.id}/edit`)
}

export async function updateBlogPost(id: string, formData: FormData) {
  const rawData = {
    title: formData.get('title') as string,
    excerpt: formData.get('excerpt') as string || null,
    content: formData.get('content') as string || null,
    featured_image: formData.get('featuredImage') as string || null,
    tags: JSON.parse(formData.get('tags') as string || '[]'),
    author: formData.get('author') as string || null,
    city: formData.get('city') as string || null,
    state: formData.get('state') as string || null,
    published: formData.get('published') === 'true',
    published_at: formData.get('publishedAt') as string || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // Handle slug update
  let slug = formData.get('slug') as string
  if (!slug) {
    slug = slugify(rawData.title, { lower: true, strict: true })
  }

  // Check if slug already exists (excluding current post)
  const { data: existingPost } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('slug', slug)
    .neq('id', id)
    .single()

  if (existingPost) {
    throw new Error('A post with this slug already exists. Please use a different title or custom slug.')
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .update({
      ...rawData,
      slug,
      published_at: rawData.published ? rawData.published_at : null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating blog post:', error)
    throw new Error('Failed to update blog post')
  }

  revalidatePath('/blog')
  revalidatePath(`/blog/${slug}`)
  revalidatePath('/admin/blog')
  
  return data
}

export async function deleteBlogPost(id: string) {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting blog post:', error)
    throw new Error('Failed to delete blog post')
  }

  revalidatePath('/blog')
  revalidatePath('/admin/blog')
}

export async function uploadBlogImage(formData: FormData) {
  const file = formData.get('file') as File
  
  if (!file) {
    throw new Error('No file provided')
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('File type not allowed. Please upload JPEG, PNG, WebP, or GIF.')
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size too large. Maximum size is 5MB.')
  }

  const fileName = `${Date.now()}-${file.name}`
  const filePath = `blog-images/${fileName}`

  const { data, error } = await supabase.storage
    .from('blog-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Error uploading image:', error)
    throw new Error('Failed to upload image')
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('blog-images')
    .getPublicUrl(filePath)

  return { url: publicUrl }
}