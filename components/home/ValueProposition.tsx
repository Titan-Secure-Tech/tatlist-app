'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Package, Users, Zap, Award } from 'lucide-react'

export default function ValueProposition() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.6,
        ease: 'easeOut',
      },
    }),
  }

  const imageReveal = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  }

  const features = [
    {
      icon: Package,
      title: 'Black Eye Products',
      description:
        'Delivering professional-grade tattoo inks, needles, machines, and studio supplies exclusively from Black Eye Products.',
    },
    {
      icon: Zap,
      title: 'Lightning-Fast Delivery',
      description:
        'Same-day delivery to licensed tattoo shops across Tampa Bay. Your supplies arrive when you need them.',
    },
    {
      icon: Users,
      title: 'Artist-First Service',
      description:
        'Built by artists, for artists. We understand your workflow and stock the supplies you actually use.',
    },
    {
      icon: Award,
      title: 'Verified & Licensed',
      description:
        'Serving only licensed tattoo professionals in Tampa Bay. Quality assurance you can trust.',
    },
  ]

  return (
    <section className="relative py-24 bg-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50 opacity-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-light text-gray-900 mb-4">
            Why Tampa Artists Choose Tatlist
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            The official delivery and logistics service for Black Eye Products Tattoo Supply in
            Tampa Bay
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              custom={index + 1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeInUp}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-black/5 mb-4">
                <feature.icon className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Image Showcase */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Delivery Van */}
          <motion.div
            custom={5}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={imageReveal}
            className="lg:col-span-2"
          >
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100 group">
              <Image
                src="/assets/images/tatlist-delivery-van.jpg"
                alt="Tatlist delivery van bringing supplies to Tampa tattoo shops"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 66vw"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                <h3 className="text-white text-2xl font-medium mb-2">Fast Local Delivery</h3>
                <p className="text-white/90 text-sm">
                  Same-day delivery across Tampa Bay for licensed tattoo shops
                </p>
              </div>
            </div>
          </motion.div>

          {/* Ink Supplies */}
          <motion.div
            custom={6}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={imageReveal}
          >
            <div className="relative aspect-[9/16] lg:aspect-[9/16] rounded-2xl overflow-hidden bg-gray-100 group">
              <Image
                src="/assets/images/tatlist-ink-supplies.jpeg"
                alt="Professional tattoo inks and supplies in Tampa shop"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                <h3 className="text-white text-xl font-medium mb-2">Premium Supplies</h3>
                <p className="text-white/90 text-sm">
                  Top brands artists trust for professional results
                </p>
              </div>
            </div>
          </motion.div>

          {/* Artists Conversation */}
          <motion.div
            custom={7}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={imageReveal}
          >
            <div className="relative aspect-[16/9] lg:aspect-[9/16] rounded-2xl overflow-hidden bg-gray-100 group">
              <Image
                src="/assets/images/tatlist-artists-in-shop-conversation.jpeg"
                alt="Tampa tattoo artists collaborating in shop"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                <h3 className="text-white text-xl font-medium mb-2">Artist Community</h3>
                <p className="text-white/90 text-sm">
                  Supporting Tampa Bay&apos;s thriving tattoo culture
                </p>
              </div>
            </div>
          </motion.div>

          {/* Mascot */}
          <motion.div
            custom={8}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={imageReveal}
            className="lg:col-span-2"
          >
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100 group">
              <Image
                src="/assets/images/tatlist-artist-tattoo-mascot.jpg"
                alt="Tatlist mascot representing Tampa tattoo culture"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 66vw"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                <h3 className="text-white text-2xl font-medium mb-2">Built for Artists</h3>
                <p className="text-white/90 text-sm">
                  We speak your language and understand your needs
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.div
          custom={9}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeInUp}
          className="mt-20 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <a
              href="/login"
              className="px-8 py-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-all duration-300"
            >
              Start Ordering Today
            </a>
            <a
              href="/contact"
              className="px-8 py-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300"
            >
              Contact Our Team
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
