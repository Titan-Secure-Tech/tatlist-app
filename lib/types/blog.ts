export type PostType = 'post' | 'event'
export type PostStatus = 'draft' | 'published' | 'archived'

export interface BlogPost {
  id: string

  // Basic Post Fields
  title: string
  slug: string
  excerpt?: string
  content: string

  // Post Type
  post_type: PostType

  // Author Information
  author_name: string
  author_email?: string

  // Publishing Status
  status: PostStatus
  published_at?: string

  // Featured Image
  featured_image_url?: string
  featured_image_alt?: string

  // Event-Specific Fields
  event_start_time?: string
  event_end_time?: string
  event_location?: string
  event_address?: string
  event_city?: string
  event_state?: string
  event_zip?: string
  event_contact_name?: string
  event_contact_email?: string
  event_contact_phone?: string
  event_registration_url?: string

  // SEO Fields
  meta_title?: string
  meta_description?: string
  meta_keywords?: string[]
  canonical_url?: string
  og_image_url?: string
  og_title?: string
  og_description?: string
  twitter_card_type?: string

  // Categories and Tags
  categories?: string[]
  tags?: string[]

  // Engagement Metrics
  view_count?: number

  // Timestamps
  created_at: string
  updated_at: string
}
