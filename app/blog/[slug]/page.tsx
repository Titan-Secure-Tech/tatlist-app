import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BlogPost } from '@/lib/types/blog'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, MapPin, Mail, ExternalLink, ArrowLeft } from 'lucide-react'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', resolvedParams.slug)
    .eq('status', 'published')
    .single()

  if (!post) {
    return {
      title: 'Post Not Found | Tatlist',
    }
  }

  const blogPost = post as BlogPost

  return {
    title: blogPost.meta_title || `${blogPost.title} | Tatlist Blog`,
    description: blogPost.meta_description || blogPost.excerpt || '',
    keywords: blogPost.meta_keywords || [],
    openGraph: {
      title: blogPost.og_title || blogPost.title,
      description: blogPost.og_description || blogPost.excerpt || '',
      type: 'article',
      publishedTime: blogPost.published_at || undefined,
      authors: [blogPost.author_name],
      images: blogPost.og_image_url
        ? [
            {
              url: blogPost.og_image_url,
              alt: blogPost.featured_image_alt || blogPost.title,
            },
          ]
        : blogPost.featured_image_url
          ? [
              {
                url: blogPost.featured_image_url,
                alt: blogPost.featured_image_alt || blogPost.title,
              },
            ]
          : undefined,
    },
    twitter: {
      card:
        (blogPost.twitter_card_type as 'summary' | 'summary_large_image') || 'summary_large_image',
      title: blogPost.og_title || blogPost.title,
      description: blogPost.og_description || blogPost.excerpt || '',
      images: blogPost.og_image_url || blogPost.featured_image_url || undefined,
    },
    alternates: {
      canonical: blogPost.canonical_url || undefined,
    },
  }
}

async function BlogPostContent({ slug }: { slug: string }) {
  const supabase = await createClient()

  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !post) {
    notFound()
  }

  const blogPost = post as BlogPost

  // Increment view count (non-blocking)
  supabase
    .from('blog_posts')
    .update({ view_count: (blogPost.view_count || 0) + 1 })
    .eq('id', blogPost.id)
    .then(() => {})

  return (
    <article className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Blog
      </Link>

      {/* Post Type Badge */}
      {blogPost.post_type === 'event' && (
        <div className="inline-flex px-4 py-2 bg-black text-white text-sm font-medium rounded-full mb-6">
          Event
        </div>
      )}

      {/* Categories */}
      {blogPost.categories && blogPost.categories.length > 0 && (
        <div className="flex gap-3 mb-4">
          {blogPost.categories.map(category => (
            <span
              key={category}
              className="text-sm text-gray-600 font-medium uppercase tracking-wide"
            >
              {category}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h1 className="text-5xl lg:text-6xl font-light text-gray-900 mb-6">{blogPost.title}</h1>

      {/* Meta Information */}
      <div className="flex items-center gap-4 text-gray-600 mb-8 pb-8 border-b border-gray-200">
        <span className="font-medium">{blogPost.author_name}</span>
        {blogPost.published_at && (
          <>
            <span>·</span>
            <time>
              {new Date(blogPost.published_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
          </>
        )}
        {blogPost.view_count !== undefined && blogPost.view_count > 0 && (
          <>
            <span>·</span>
            <span>{blogPost.view_count} views</span>
          </>
        )}
      </div>

      {/* Featured Image */}
      {blogPost.featured_image_url && (
        <div className="relative aspect-[16/9] bg-gray-100 rounded-2xl overflow-hidden mb-12">
          <Image
            src={blogPost.featured_image_url}
            alt={blogPost.featured_image_alt || blogPost.title}
            fill
            className="object-cover"
            sizes="(max-width: 1200px) 100vw, 1200px"
            priority
          />
        </div>
      )}

      {/* Event Details Card */}
      {blogPost.post_type === 'event' && (
        <div className="bg-gray-50 rounded-2xl p-8 mb-12 border border-gray-200">
          <h2 className="text-2xl font-medium text-gray-900 mb-6">Event Details</h2>

          <div className="space-y-4">
            {blogPost.event_start_time && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Date & Time</p>
                  <p className="text-gray-600">
                    {new Date(blogPost.event_start_time).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  {blogPost.event_end_time && (
                    <p className="text-gray-600 text-sm">
                      {new Date(blogPost.event_start_time).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}{' '}
                      -{' '}
                      {new Date(blogPost.event_end_time).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              </div>
            )}

            {(blogPost.event_location || blogPost.event_address) && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Location</p>
                  {blogPost.event_location && (
                    <p className="text-gray-600">{blogPost.event_location}</p>
                  )}
                  {blogPost.event_address && (
                    <p className="text-gray-600">
                      {blogPost.event_address}
                      {blogPost.event_city && `, ${blogPost.event_city}`}
                      {blogPost.event_state && `, ${blogPost.event_state}`}
                      {blogPost.event_zip && ` ${blogPost.event_zip}`}
                    </p>
                  )}
                </div>
              </div>
            )}

            {(blogPost.event_contact_email || blogPost.event_contact_phone) && (
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Contact</p>
                  {blogPost.event_contact_name && (
                    <p className="text-gray-600">{blogPost.event_contact_name}</p>
                  )}
                  {blogPost.event_contact_email && (
                    <a
                      href={`mailto:${blogPost.event_contact_email}`}
                      className="text-gray-600 hover:text-gray-900 block"
                    >
                      {blogPost.event_contact_email}
                    </a>
                  )}
                  {blogPost.event_contact_phone && (
                    <a
                      href={`tel:${blogPost.event_contact_phone}`}
                      className="text-gray-600 hover:text-gray-900 block"
                    >
                      {blogPost.event_contact_phone}
                    </a>
                  )}
                </div>
              </div>
            )}

            {blogPost.event_registration_url && (
              <div className="pt-4">
                <a
                  href={blogPost.event_registration_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Register for Event
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Post Content */}
      <div
        className="prose prose-lg prose-gray max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: blogPost.content }}
      />

      {/* Tags */}
      {blogPost.tags && blogPost.tags.length > 0 && (
        <div className="pt-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {blogPost.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}

function BlogPostSkeleton() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-24 mb-8" />
      <div className="h-12 bg-gray-200 rounded w-3/4 mb-6" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-8" />
      <div className="aspect-[16/9] bg-gray-200 rounded-2xl mb-12" />
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
    </div>
  )
}

export default async function BlogPostPage({ params }: Props) {
  const resolvedParams = await params

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Suspense fallback={<BlogPostSkeleton />}>
          <BlogPostContent slug={resolvedParams.slug} />
        </Suspense>
      </div>
    </div>
  )
}
