import { Suspense } from 'react'
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { BlogPost } from '@/lib/types/blog'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, MapPin, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog & Events | Tatlist - Tampa Tattoo Supply News',
  description:
    'Stay updated with the latest tattoo industry news, events, and announcements from Tatlist Tampa. Find upcoming tattoo conventions, product releases, and community updates.',
  keywords: [
    'Tampa tattoo news',
    'tattoo events Tampa',
    'tattoo conventions Florida',
    'tattoo industry news',
    'Tampa tattoo community',
  ],
  openGraph: {
    title: 'Blog & Events | Tatlist',
    description: 'Latest tattoo industry news and events from Tampa Bay',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog & Events | Tatlist',
    description: 'Latest tattoo industry news and events from Tampa Bay',
  },
}

async function BlogList() {
  const supabase = await createClient()

  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Error fetching blog posts:', error)
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Unable to load posts at this time.</p>
      </div>
    )
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No posts available yet. Check back soon!</p>
      </div>
    )
  }

  const blogPosts = posts as BlogPost[]

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {blogPosts.map(post => (
        <Link key={post.id} href={`/blog/${post.slug}`}>
          <article className="group cursor-pointer">
            {/* Featured Image */}
            <div className="relative aspect-[16/9] bg-gray-100 rounded-2xl overflow-hidden mb-4">
              {post.featured_image_url ? (
                <Image
                  src={post.featured_image_url}
                  alt={post.featured_image_alt || post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-gray-400">No image</span>
                </div>
              )}

              {/* Post Type Badge */}
              {post.post_type === 'event' && (
                <div className="absolute top-4 left-4 px-3 py-1 bg-black text-white text-xs font-medium rounded-full">
                  Event
                </div>
              )}
            </div>

            {/* Post Content */}
            <div>
              {/* Categories */}
              {post.categories && post.categories.length > 0 && (
                <div className="flex gap-2 mb-2">
                  {post.categories.slice(0, 2).map(category => (
                    <span
                      key={category}
                      className="text-xs text-gray-600 font-medium uppercase tracking-wide"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h2 className="text-2xl font-medium text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                {post.title}
              </h2>

              {/* Event Details */}
              {post.post_type === 'event' && post.event_start_time && (
                <div className="space-y-1 mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <time>
                      {new Date(post.event_start_time).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </time>
                  </div>
                  {post.event_location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{post.event_location}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Excerpt */}
              {post.excerpt && <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>}

              {/* Meta Info */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{post.author_name}</span>
                {post.published_at && (
                  <time>
                    {new Date(post.published_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                )}
              </div>

              {/* Read More */}
              <div className="mt-4 flex items-center gap-2 text-black font-medium group-hover:gap-3 transition-all">
                <span>{post.post_type === 'event' ? 'View Event' : 'Read More'}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  )
}

function BlogListSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[16/9] bg-gray-200 rounded-2xl mb-4" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-light text-gray-900 mb-4">Blog & Events</h1>
            <p className="text-lg text-gray-600">
              Stay connected with the Tampa tattoo community. Get the latest news, event
              announcements, and industry updates.
            </p>
          </div>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Suspense fallback={<BlogListSkeleton />}>
          <BlogList />
        </Suspense>
      </div>
    </div>
  )
}
