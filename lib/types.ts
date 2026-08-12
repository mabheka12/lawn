// lib/types.ts
export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  featured_image: string | null
  published_at: string | null
  updated_at: string
  tags: string[]
  author: string | null
  city: string | null
  state: string | null
  published: boolean
  createdAt: string
}