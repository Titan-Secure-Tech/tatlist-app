import { Star } from 'lucide-react'

interface Testimonial {
  id: number
  name: string
  role: string
  shop: string
  content: string
  rating: number
  image?: string
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Marcus Rodriguez',
    role: 'Owner',
    shop: 'Ink & Honor Tattoo',
    content:
      "Tatlist has completely transformed how we order supplies. Same-day delivery means we never run out of essentials during busy sessions. It's a game changer for our shop.",
    rating: 5,
  },
  {
    id: 2,
    name: 'Sarah Chen',
    role: 'Shop Manager',
    shop: 'Black Eye Tattoo',
    content:
      'The inventory tracking feature is incredible. We can see what we need at a glance and reorder with just a few clicks. No more spreadsheets or missed orders.',
    rating: 5,
  },
  {
    id: 3,
    name: 'James Wilson',
    role: 'Lead Artist',
    shop: 'Stigma Ink',
    content:
      "As artists, we need our supplies fast. Tatlist delivers within hours, not days. The quality of products is always top-notch. Wouldn't order from anywhere else.",
    rating: 5,
  },
]

export default function Testimonials() {
  return (
    <section className="py-16 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Trusted by Tampa Bay&apos;s Top Tattoo Shops
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what professional tattoo artists and shop owners are saying about Tatlist
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map(testimonial => (
            <div
              key={testimonial.id}
              className="bg-secondary p-6 rounded-xl border border-border hover:border-brand/50 transition-colors"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-brand text-brand" />
                ))}
              </div>

              {/* Content */}
              <blockquote className="text-muted-foreground mb-6 italic">
                &ldquo;{testimonial.content}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="border-t border-border pt-4">
                <div className="font-semibold text-foreground">{testimonial.name}</div>
                <div className="text-sm text-muted-foreground">
                  {testimonial.role}, {testimonial.shop}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Join hundreds of satisfied tattoo professionals in Tampa Bay
          </p>
          <a
            href="/register"
            className="inline-block bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground px-8 py-3 rounded-xl font-medium transition-colors"
          >
            Get Started Today
          </a>
        </div>
      </div>
    </section>
  )
}
