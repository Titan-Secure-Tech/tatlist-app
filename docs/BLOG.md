# Blog & Events System

Comprehensive blog and events system for Tatlist with full SEO support, event management, and secure content administration.

## Overview

The blog system supports two types of posts:

1. **Regular Blog Posts** - Industry news, product announcements, guides, etc.
2. **Event Posts** - Tattoo conventions, community events, workshops with full event details

## Features

### Content Management

- **Service Role Only Access** - Only the service role account can create/edit posts
- **Draft & Published Status** - Control post visibility
- **Rich Content** - HTML content support with full formatting
- **Featured Images** - Stored in Supabase Storage with public access
- **Categories & Tags** - Organize and filter content
- **View Tracking** - Automatic view count increment

### SEO Optimization

All posts include comprehensive SEO fields:

- Meta title, description, and keywords
- Canonical URLs
- Open Graph tags (Facebook, LinkedIn)
- Twitter Card metadata
- Structured data for search engines

### Event Support

Event posts include additional fields:

- Event dates and times
- Location and address information
- Contact details
- Registration URLs
- Custom event-specific content

## Database Schema

### Table: `blog_posts`

See the complete schema in `/supabase/migrations/20251014000000_create_blog_posts.sql`

Key columns:

```typescript
{
  id: UUID
  title: string
  slug: string (auto-generated from title)
  content: string (HTML)
  post_type: 'post' | 'event'
  status: 'draft' | 'published' | 'archived'
  featured_image_url: string
  event_start_time: timestamp (for events)
  event_location: string (for events)
  meta_title: string (SEO)
  meta_description: string (SEO)
  categories: string[]
  tags: string[]
  published_at: timestamp
  view_count: number
}
```

### Storage Bucket: `blog-images`

- Public read access
- Service role only for uploads
- Used for featured images and event flyers

## Adding Blog Posts

### Method 1: Using Supabase Dashboard (Recommended)

1. Log in to Supabase Dashboard
2. Navigate to **Table Editor** > `blog_posts`
3. Click **Insert row**
4. Fill in the required fields:
   - `title` - Post title (slug auto-generates)
   - `content` - HTML content
   - `post_type` - 'post' or 'event'
   - `status` - 'published' to make visible
   - `published_at` - Set to NOW() or future date
   - Add SEO fields, categories, tags, etc.

### Method 2: Using Scripts

Use the service role key to programmatically add posts:

```bash
# Set up environment variables
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Run the Inkmania Fest example script
bun run scripts/add-inkmania-fest-event.ts
```

Create new scripts based on the template in `/scripts/add-inkmania-fest-event.ts`

### Method 3: Using Supabase SQL Editor

```sql
INSERT INTO blog_posts (
  title,
  content,
  post_type,
  status,
  published_at,
  featured_image_url,
  meta_title,
  meta_description,
  categories,
  tags
) VALUES (
  'Your Post Title',
  '<p>Your HTML content here...</p>',
  'post',
  'published',
  NOW(),
  'https://your-image-url.jpg',
  'SEO Title',
  'SEO description',
  ARRAY['Category1', 'Category2'],
  ARRAY['tag1', 'tag2']
);
```

## Event Posts

When creating an event post, include these additional fields:

```typescript
{
  post_type: 'event',
  event_start_time: '2026-04-24T10:00:00-04:00',
  event_end_time: '2026-04-26T22:00:00-04:00',
  event_location: 'Tampa Convention Center',
  event_address: '333 S Franklin St',
  event_city: 'Tampa',
  event_state: 'FL',
  event_zip: '33602',
  event_contact_name: 'Contact Name',
  event_contact_email: 'email@example.com',
  event_contact_phone: '(813) 555-1234',
  event_registration_url: 'https://register.example.com'
}
```

## Uploading Images

### Using Supabase Dashboard

1. Navigate to **Storage** > `blog-images`
2. Click **Upload file**
3. Select your image
4. After upload, click the image and copy the public URL
5. Use this URL in your post's `featured_image_url` field

### Using the API

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Upload image
const { data, error } = await supabase.storage
  .from('blog-images')
  .upload('my-image.jpg', fileBuffer, {
    contentType: 'image/jpeg',
  })

// Get public URL
const {
  data: { publicUrl },
} = supabase.storage.from('blog-images').getPublicUrl('my-image.jpg')
```

## SEO Best Practices

### Meta Fields

- **meta_title** - Keep under 60 characters
- **meta_description** - Keep under 160 characters
- **meta_keywords** - 5-10 relevant keywords
- **canonical_url** - Use for cross-posting or republished content

### Open Graph

- **og_title** - Can be different from meta_title (more social-friendly)
- **og_description** - Keep under 200 characters
- **og_image_url** - Use 1200x630px images for best results

### Content Guidelines

1. Use proper HTML heading hierarchy (h2, h3, h4)
2. Include relevant internal links
3. Add alt text to images
4. Keep paragraphs concise
5. Use lists for better readability

## Routes

- **Blog Index**: `/blog` - Lists all published posts
- **Individual Post**: `/blog/[slug]` - Single post view with full SEO

## Row Level Security

The following RLS policies are in place:

- **Public Read** - Anyone can read published posts
- **Service Role Only** - All write operations require service role key

This ensures content security while maintaining public accessibility.

## Monitoring

Track post performance:

```sql
-- Most viewed posts
SELECT title, view_count, published_at
FROM blog_posts
WHERE status = 'published'
ORDER BY view_count DESC
LIMIT 10;

-- Recent posts
SELECT title, published_at, categories
FROM blog_posts
WHERE status = 'published'
ORDER BY published_at DESC
LIMIT 10;

-- Upcoming events
SELECT title, event_start_time, event_location
FROM blog_posts
WHERE post_type = 'event'
  AND status = 'published'
  AND event_start_time > NOW()
ORDER BY event_start_time ASC;
```

## Troubleshooting

### Posts not appearing

1. Check `status` is set to 'published'
2. Verify `published_at` is in the past
3. Check RLS policies are enabled

### Images not loading

1. Verify image is uploaded to `blog-images` bucket
2. Check bucket has public read access
3. Ensure URL is correct in `featured_image_url`

### Slug conflicts

Slugs are auto-generated from titles and must be unique. If you get a conflict:

1. Manually set a unique slug
2. Or modify the title slightly

## Future Enhancements

Potential improvements:

- Admin dashboard for post management
- Rich text editor integration
- Image optimization and resizing
- Comment system
- Email notifications for new posts
- RSS feed
- Search functionality
- Related posts suggestions

## Support

For issues or questions about the blog system:

1. Check this documentation
2. Review the migration file: `/supabase/migrations/20251014000000_create_blog_posts.sql`
3. Check example script: `/scripts/add-inkmania-fest-event.ts`
4. Consult Supabase documentation for storage and RLS

---

**Last Updated**: October 2025
**Version**: 1.0.0
