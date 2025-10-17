-- Create blog_posts table with comprehensive SEO and event support
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Post Fields
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,

  -- Post Type (regular post or event)
  post_type TEXT NOT NULL DEFAULT 'post' CHECK (post_type IN ('post', 'event')),

  -- Author Information (service role only)
  author_name TEXT NOT NULL DEFAULT 'Tatlist Team',
  author_email TEXT,

  -- Publishing Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,

  -- Featured Image (stored in Supabase Storage)
  featured_image_url TEXT,
  featured_image_alt TEXT,

  -- Event-Specific Fields (nullable for regular posts)
  event_start_time TIMESTAMPTZ,
  event_end_time TIMESTAMPTZ,
  event_location TEXT,
  event_address TEXT,
  event_city TEXT,
  event_state TEXT DEFAULT 'FL',
  event_zip TEXT,
  event_contact_name TEXT,
  event_contact_email TEXT,
  event_contact_phone TEXT,
  event_registration_url TEXT,

  -- SEO Fields
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  canonical_url TEXT,
  og_image_url TEXT,
  og_title TEXT,
  og_description TEXT,
  twitter_card_type TEXT DEFAULT 'summary_large_image',

  -- Categories and Tags
  categories TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',

  -- Engagement Metrics
  view_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_post_type ON public.blog_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_event_start ON public.blog_posts(event_start_time) WHERE post_type = 'event';
CREATE INDEX IF NOT EXISTS idx_blog_posts_categories ON public.blog_posts USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON public.blog_posts USING GIN(tags);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Allow anyone to read published posts
CREATE POLICY "Anyone can read published blog posts"
  ON public.blog_posts
  FOR SELECT
  USING (status = 'published');

-- Only service role can insert posts
CREATE POLICY "Only service role can insert blog posts"
  ON public.blog_posts
  FOR INSERT
  WITH CHECK (false); -- This will be overridden by service role

-- Only service role can update posts
CREATE POLICY "Only service role can update blog posts"
  ON public.blog_posts
  FOR UPDATE
  USING (false); -- This will be overridden by service role

-- Only service role can delete posts
CREATE POLICY "Only service role can delete blog posts"
  ON public.blog_posts
  FOR DELETE
  USING (false); -- This will be overridden by service role

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on every update
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_blog_posts_updated_at();

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION public.generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(title, '[^\w\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to auto-generate slug if not provided
CREATE OR REPLACE FUNCTION public.auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug = public.generate_slug(NEW.title);

    -- Ensure slug is unique by appending a number if necessary
    WHILE EXISTS (SELECT 1 FROM public.blog_posts WHERE slug = NEW.slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)) LOOP
      NEW.slug = NEW.slug || '-' || FLOOR(RANDOM() * 1000)::TEXT;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate slug
CREATE TRIGGER auto_generate_blog_slug
  BEFORE INSERT OR UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_slug();

-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for blog images

-- Allow anyone to read blog images
CREATE POLICY "Anyone can read blog images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'blog-images');

-- Only service role can upload blog images
CREATE POLICY "Only service role can upload blog images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'blog-images' AND false); -- Service role override

-- Only service role can update blog images
CREATE POLICY "Only service role can update blog images"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'blog-images' AND false); -- Service role override

-- Only service role can delete blog images
CREATE POLICY "Only service role can delete blog images"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'blog-images' AND false); -- Service role override

-- Comments and feedback for documentation
COMMENT ON TABLE public.blog_posts IS 'Blog posts and events for Tatlist. Only the service role can create/edit posts. Public can read published posts.';
COMMENT ON COLUMN public.blog_posts.post_type IS 'Type of post: "post" for regular blog posts, "event" for event announcements';
COMMENT ON COLUMN public.blog_posts.status IS 'Publishing status: draft, published, or archived';
COMMENT ON COLUMN public.blog_posts.featured_image_url IS 'URL to the featured image stored in Supabase Storage blog-images bucket';
COMMENT ON COLUMN public.blog_posts.meta_title IS 'SEO meta title (defaults to title if not provided)';
COMMENT ON COLUMN public.blog_posts.meta_description IS 'SEO meta description for search engines';
COMMENT ON COLUMN public.blog_posts.canonical_url IS 'Canonical URL for SEO (prevents duplicate content issues)';
