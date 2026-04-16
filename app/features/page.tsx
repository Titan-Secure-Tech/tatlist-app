'use client'

import { motion } from 'framer-motion'
import {
  Truck,
  Clock,
  MapPin,
  Shield,
  Package,
  CheckCircle2,
  Download,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

export default function FeaturesPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 text-sm font-medium text-foreground mb-6"
            >
              <Truck className="w-4 h-4" />
              Black Eye Products Delivery & Logistics
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl lg:text-6xl font-light text-foreground mb-6"
            >
              How Tatlist Works
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8"
            >
              The official delivery and logistics platform for Black Eye Products Tattoo Supply,
              serving licensed professionals in Tampa Bay
            </motion.p>

            <motion.div variants={itemVariants}>
              <Link href="/login">
                <button className="group px-8 py-4 bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 mx-auto">
                  Get Started Today
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-foreground mb-4">Simple. Fast. Reliable.</h2>
            <p className="text-lg text-muted-foreground">
              Black Eye Products tattoo supplies delivered to your shop in four easy steps
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Browse & Select',
                description:
                  'Explore our catalog of professional tattoo supplies from Black Eye Products',
                icon: Package,
              },
              {
                step: '02',
                title: 'Verify Business',
                description:
                  'Provide your tattoo shop license number and business address for validation',
                icon: Shield,
              },
              {
                step: '03',
                title: 'Secure Checkout',
                description: 'Complete your order with our secure payment processing via Square',
                icon: CheckCircle2,
              },
              {
                step: '04',
                title: 'Same-Day Delivery',
                description: 'Receive your supplies within 25 miles of Tampa, same business day',
                icon: Truck,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative p-6 bg-muted rounded-2xl transition-shadow"
              >
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center font-bold text-sm">
                  {item.step}
                </div>
                <item.icon className="w-8 h-8 text-foreground mb-4 mt-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-foreground mb-4">Why Choose Tatlist?</h2>
            <p className="text-lg text-muted-foreground">
              Built for professional tattoo artists in Tampa Bay
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: 'Same-Day Delivery',
                description:
                  'Order by 3pm and receive your supplies the same business day. Never run out of essentials again.',
              },
              {
                icon: MapPin,
                title: '25-Mile Delivery Radius',
                description:
                  'Serving Tampa, St. Petersburg, Clearwater, and all of Hillsborough County with reliable delivery.',
              },
              {
                icon: Shield,
                title: 'Business Verification',
                description:
                  'Licensed tattoo shops only. We verify your business details and tattoo shop license for security.',
              },
              {
                icon: Package,
                title: 'Premium Products',
                description:
                  'Professional-grade tattoo supplies delivered exclusively from Black Eye Products.',
              },
              {
                icon: Truck,
                title: 'Real-Time Tracking',
                description:
                  'Know exactly when your supplies will arrive with our delivery tracking system.',
              },
              {
                icon: CheckCircle2,
                title: 'Secure Payments',
                description:
                  'Industry-standard payment processing with Square. Apple Pay, Google Pay, and all major cards accepted.',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-background rounded-xl border border-border transition-colors"
              >
                <feature.icon className="w-10 h-10 text-foreground mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Details Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-light text-foreground mb-6">
                Fast, Reliable Delivery to Your Shop
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Same-Day Delivery Available
                    </h3>
                    <p className="text-muted-foreground">
                      Orders placed before 3pm are delivered the same business day
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">25-Mile Coverage Area</h3>
                    <p className="text-muted-foreground">
                      Delivery available within 25 miles of Tampa city center
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Address Validation</h3>
                    <p className="text-muted-foreground">
                      Real-time address verification ensures accurate delivery
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Distance-Based Pricing</h3>
                    <p className="text-muted-foreground">Fair delivery fees calculated based on distance</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted rounded-2xl p-8 border border-border">
              <h3 className="text-2xl font-semibold text-foreground mb-4">Business Hours</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-foreground">Monday - Saturday</span>
                  <span className="font-medium text-foreground">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-foreground">Sunday</span>
                  <span className="font-medium text-destructive">Closed</span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-info/10 rounded-xl border border-info/20">
                <p className="text-sm text-info">
                  <strong>Note:</strong> All deliveries must be to verified tattoo shop addresses
                  within our service area.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Assets Section */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-foreground mb-4">Brand Assets</h2>
            <p className="text-lg text-muted-foreground">
              Download Tatlist logos for your shop or promotional materials
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-background rounded-xl border border-border p-8 text-center transition-shadow">
              <div className="w-32 h-32 mx-auto mb-6 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-2xl">TATLIST</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">SVG Logo</h3>
              <p className="text-muted-foreground mb-6">Scalable vector format, perfect for any size</p>
              <a
                href="/logo.svg"
                download="tatlist-logo.svg"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground rounded-xl font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                Download SVG
              </a>
            </div>

            <div className="bg-background rounded-xl border border-border p-8 text-center transition-shadow">
              <div className="w-32 h-32 mx-auto mb-6 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-2xl">TATLIST</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">PNG Logo</h3>
              <p className="text-muted-foreground mb-6">High-resolution raster format for print & web</p>
              <a
                href="/logo.webp"
                download="tatlist-logo.webp"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground rounded-xl font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PNG
              </a>
            </div>
          </div>

          <div className="mt-8 p-6 bg-background rounded-xl border border-border max-w-4xl mx-auto">
            <h4 className="font-semibold text-foreground mb-2">Usage Guidelines</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <span>Maintain adequate spacing around the logo</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <span>Do not alter colors or proportions</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <span>Use on contrasting backgrounds for visibility</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-light mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join Tampa Bay&apos;s official Black Eye Products delivery and logistics platform today
          </p>
          <Link href="/login">
            <button className="px-8 py-4 bg-background text-foreground rounded-xl font-medium hover:bg-accent transition-colors">
              Create Your Account
            </button>
          </Link>
        </div>
      </section>
    </div>
  )
}
