import { ShoppingBag, Truck, Shield, CreditCard } from 'lucide-react'

export const metadata = {
  title: 'About | Tatlist',
  description:
    "Learn about Tatlist, Tampa Bay's premier delivery and logistics service for Black Eye Products Tattoo Supply.",
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-8">About Tatlist</h1>

      <div className="prose prose-invert max-w-none mb-12">
        <p className="text-lg text-foreground leading-relaxed">
          Welcome to Tatlist, Tampa Bay&apos;s premier delivery and logistics service for Black Eye
          Products Tattoo Supply. We serve as the official mobile delivery and order management
          platform, dedicated to getting professional tattoo supplies to licensed artists quickly
          and reliably.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-background border border-border rounded-xl p-6">
          <ShoppingBag className="h-10 w-10 text-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Black Eye Products Partnership</h2>
          <p className="text-muted-foreground">
            We exclusively deliver professional-grade tattoo supplies from Black Eye Products,
            ensuring every order meets the highest professional standards.
          </p>
        </div>

        <div className="bg-background border border-border rounded-xl p-6">
          <Truck className="h-10 w-10 text-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Same-Day Delivery</h2>
          <p className="text-muted-foreground">
            Get your supplies fast with our dedicated same-day delivery service to licensed tattoo
            shops throughout Tampa Bay.
          </p>
        </div>

        <div className="bg-background border border-border rounded-xl p-6">
          <Shield className="h-10 w-10 text-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Secure & Safe</h2>
          <p className="text-muted-foreground">
            Shop with confidence knowing your information is protected with industry-leading
            security measures.
          </p>
        </div>

        <div className="bg-background border border-border rounded-xl p-6">
          <CreditCard className="h-10 w-10 text-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Easy Payment</h2>
          <p className="text-muted-foreground">
            Multiple payment options available for your convenience, including all major credit
            cards.
          </p>
        </div>
      </div>

      <div className="bg-muted border border-border rounded-xl p-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Our Mission</h2>
        <p className="text-foreground leading-relaxed">
          At Tatlist, we believe every tattoo artist deserves fast, reliable access to
          professional-grade supplies from Black Eye Products. As the official delivery and
          logistics platform, we&apos;re committed to making the ordering and delivery process
          simple, reliable, and efficient, so you can focus on what you do best - creating art.
        </p>
      </div>

      <div className="mt-12 text-center">
        <h3 className="text-xl font-semibold text-foreground mb-4">Have Questions?</h3>
        <p className="text-muted-foreground mb-6">
          We&apos;re here to help. Reach out to our support team anytime.
        </p>
        <a
          href="mailto:support@tatlist.com"
          className="inline-block bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground px-6 py-3 rounded hover:bg-accent transition-colors"
        >
          Contact Support
        </a>
      </div>
    </div>
  )
}
