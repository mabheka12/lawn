// lib/blog.ts
import { supabase, BlogPost } from './supabase'

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }

  return data || []
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error) {
    console.error('Error fetching blog post:', error)
    return null
  }

  return data
}

export async function getRelatedPosts(currentPostId: string, tags: string[]): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .neq('id', currentPostId)
    .eq('published', true)
    .contains('tags', tags.slice(0, 2))
    .limit(3)

  if (error) {
    console.error('Error fetching related posts:', error)
    return []
  }

  return data || []
}