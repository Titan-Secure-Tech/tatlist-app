/**
 * Script to add the Inkmania Fest event as the first blog post
 *
 * This script uses the Supabase service role to insert the event post.
 * Run with: bun run scripts/add-inkmania-fest-event.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function uploadEventFlyer() {
  console.log('📤 Uploading Inkmania Fest event flyer...')

  const fs = await import('fs')
  const path = await import('path')

  const flyerPath = path.join(process.cwd(), 'public/assets/images/inkmania-fest-event-flyer.jpg')

  if (!fs.existsSync(flyerPath)) {
    console.error(`❌ Event flyer not found at: ${flyerPath}`)
    return null
  }

  const fileBuffer = fs.readFileSync(flyerPath)
  const fileName = `inkmania-fest-2026-${Date.now()}.jpg`

  const { error: uploadError } = await supabase.storage
    .from('blog-images')
    .upload(fileName, fileBuffer, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    console.error('❌ Error uploading flyer:', uploadError)
    return null
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('blog-images').getPublicUrl(fileName)

  console.log('✅ Event flyer uploaded successfully')
  console.log(`   URL: ${publicUrl}`)

  return publicUrl
}

async function createBlogPost(featuredImageUrl: string) {
  console.log('📝 Creating Inkmania Fest event blog post...')

  const eventData = {
    // Basic fields
    title: 'Inkmania Fest 2026 - Tampa Tattoo Convention',
    slug: 'inkmania-fest-2026-tampa',
    excerpt:
      'Join us for Inkmania Fest 2026, the premier tattoo convention featuring live competitions, custom trophies, custom tattoo services, vendors, and more. April 24-26, 2026 in Tampa Bay.',
    content: `
      <h2>Experience Tampa's Biggest Tattoo Event</h2>
      <p>Inkmania Fest 2026 is returning to Tampa Bay with an even bigger celebration of tattoo art and culture. This three-day event brings together the best artists, vendors, and enthusiasts from across Florida and beyond.</p>

      <h3>Event Highlights</h3>
      <ul>
        <li><strong>9 Live Tattoo Competitions</strong> - Watch master artists compete in various styles and categories</li>
        <li><strong>Custom Trophies</strong> - Unique awards for competition winners</li>
        <li><strong>Custom Tattoo Services</strong> - Get inked by some of the industry's best artists</li>
        <li><strong>180 Booths Available</strong> - Vendors, artists, and suppliers showcasing the latest in tattoo supplies and artwork</li>
      </ul>

      <h3>Important Information</h3>
      <p>This is a ticketed event. Space is limited, so register early to secure your spot whether you're competing, vending, or attending.</p>

      <p>Follow <strong>@inkmaniafest1</strong> on social media for updates and announcements. Visit <a href="https://www.inkmaniafest.com" target="_blank" rel="noopener noreferrer">www.inkmaniafest.com</a> for more details.</p>

      <h3>Why Attend?</h3>
      <p>Inkmania Fest isn't just a convention—it's where the Tampa Bay tattoo community comes together. Network with fellow artists, discover new techniques, find suppliers, and immerse yourself in tattoo culture.</p>

      <p><strong>Tatlist is proud to support the Tampa tattoo community.</strong> We'll be there connecting with local artists and shops. Come say hello!</p>
    `,
    post_type: 'event' as const,
    status: 'published' as const,
    published_at: new Date().toISOString(),

    // Author
    author_name: 'Tatlist Team',
    author_email: 'team@tatlist.com',

    // Featured image
    featured_image_url: featuredImageUrl,
    featured_image_alt: 'Inkmania Fest 2026 event flyer featuring tattoo art and event details',

    // Event details
    event_start_time: '2026-04-24T10:00:00-04:00', // April 24, 2026
    event_end_time: '2026-04-26T22:00:00-04:00', // April 26, 2026
    event_location: 'Tampa Convention Center',
    event_address: '333 S Franklin St',
    event_city: 'Tampa',
    event_state: 'FL',
    event_zip: '33602',
    event_contact_name: 'Inkmania Fest',
    event_contact_email: 'info@inkmaniafest.com',
    event_registration_url: 'https://www.inkmaniafest.com',

    // SEO
    meta_title: 'Inkmania Fest 2026 Tampa - Tattoo Convention April 24-26 | Tatlist',
    meta_description:
      'Join Inkmania Fest 2026 in Tampa, FL on April 24-26. Experience 9 live tattoo competitions, custom services, 180 vendor booths, and connect with the Tampa tattoo community.',
    meta_keywords: [
      'Inkmania Fest',
      'Tampa tattoo convention',
      'tattoo competition Tampa',
      'Florida tattoo event',
      'Tampa tattoo community',
      'tattoo convention 2026',
      'tattoo artists Tampa',
      'tattoo vendors',
    ],
    og_title: 'Inkmania Fest 2026 - Tampa Tattoo Convention',
    og_description:
      '3-day tattoo convention featuring live competitions, custom services, and 180 vendor booths. April 24-26, 2026 in Tampa, FL.',
    og_image_url: featuredImageUrl,

    // Categories and tags
    categories: ['Events', 'Community', 'Conventions'],
    tags: [
      'inkmania-fest',
      'tampa-convention',
      'tattoo-competition',
      'tattoo-event',
      '2026',
      'tampa-bay',
    ],
  }

  const { data, error } = await supabase.from('blog_posts').insert([eventData]).select().single()

  if (error) {
    console.error('❌ Error creating blog post:', error)
    return false
  }

  console.log('✅ Blog post created successfully')
  console.log(`   Post ID: ${data.id}`)
  console.log(`   Slug: ${data.slug}`)
  console.log(`   View at: /blog/${data.slug}`)

  return true
}

async function main() {
  console.log('🚀 Adding Inkmania Fest 2026 event to blog...\n')

  // Step 1: Upload the event flyer
  const featuredImageUrl = await uploadEventFlyer()

  if (!featuredImageUrl) {
    console.error('\n❌ Failed to upload event flyer. Aborting.')
    process.exit(1)
  }

  console.log('')

  // Step 2: Create the blog post
  const success = await createBlogPost(featuredImageUrl)

  if (!success) {
    console.error('\n❌ Failed to create blog post. Aborting.')
    process.exit(1)
  }

  console.log('\n✅ Inkmania Fest event successfully added to blog!')
  console.log('   Visit http://localhost:7500/blog to view the post')
}

main()
