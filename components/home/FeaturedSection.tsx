'use client'

import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Zap, Shield, Award, Package } from 'lucide-react'
import { useRef } from 'react'

const categories = [
  {
    title: 'Tattoo Machines',
    description: 'Professional rotary and coil machines',
    icon: Zap,
    href: '/categories/machines',
    color: 'from-purple-500 to-pink-500',
  },
  {
    title: 'Needles & Cartridges',
    description: 'Premium quality, sterile supplies',
    icon: Shield,
    href: '/categories/needles',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Inks & Colors',
    description: 'Vibrant, long-lasting tattoo inks',
    icon: Award,
    href: '/categories/inks',
    color: 'from-green-500 to-emerald-500',
  },
  {
    title: 'Aftercare',
    description: 'Essential healing and care products',
    icon: Package,
    href: '/categories/aftercare',
    color: 'from-orange-500 to-red-500',
  },
]

export default function FeaturedSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  }

  return (
    <section ref={ref} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-light text-gray-900 mb-4">Shop by Category</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our comprehensive range of professional tattoo supplies
          </p>
        </motion.div>

        {/* Category Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {categories.map(category => {
            const Icon = category.icon
            return (
              <motion.div
                key={category.title}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group relative"
              >
                <Link href={category.href}>
                  <div className="relative bg-white rounded-2xl border border-gray-200 p-8 hover:border-gray-300 transition-all duration-300 hover:shadow-xl overflow-hidden">
                    {/* Gradient Background */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                    />

                    {/* Icon */}
                    <motion.div
                      className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} text-white mb-6`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Icon className="w-7 h-7" />
                    </motion.div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{category.description}</p>

                    {/* Arrow */}
                    <div className="flex items-center text-gray-900 font-medium">
                      <span className="mr-2">Browse</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <Link href="/categories">
            <motion.button
              className="inline-flex items-center gap-2 px-6 py-3 text-gray-700 font-medium hover:text-gray-900 transition-colors"
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              View all categories
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
