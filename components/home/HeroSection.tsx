'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import { useRef } from 'react'

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0])

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.8,
        ease: 'easeOut',
      },
    }),
  }

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1,
        ease: 'easeOut',
      },
    },
  }

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-gray-50"
    >
      {/* Parallax Background */}
      <motion.div className="absolute inset-0 z-0" style={{ y }}>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100/50 via-transparent to-gray-100/50" />
      </motion.div>

      {/* Main Content */}
      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
        style={{ opacity }}
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left">
            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={textVariants}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 text-sm font-medium text-gray-700 mb-6"
            >
              <ShoppingBag className="w-4 h-4" />
              Premium Tattoo Supplies
            </motion.div>

            <motion.h1
              custom={1}
              initial="hidden"
              animate="visible"
              variants={textVariants}
              className="text-5xl lg:text-7xl font-light text-gray-900 mb-6 leading-tight"
            >
              Elevate Your
              <span className="block font-normal">Craft</span>
            </motion.h1>

            <motion.p
              custom={2}
              initial="hidden"
              animate="visible"
              variants={textVariants}
              className="text-lg text-gray-600 mb-8 max-w-md mx-auto lg:mx-0"
            >
              Discover professional-grade tattoo supplies from Lucky Supply Co. Quality tools for
              artists who demand excellence.
            </motion.p>

            <motion.div
              custom={3}
              initial="hidden"
              animate="visible"
              variants={textVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link href="/products">
                <motion.button
                  className="group px-8 py-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Shop Collection
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>

              <Link href="/categories">
                <motion.button
                  className="px-8 py-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Browse Categories
                </motion.button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              custom={4}
              initial="hidden"
              animate="visible"
              variants={textVariants}
              className="grid grid-cols-3 gap-8 mt-12 pt-12 border-t border-gray-200"
            >
              <div>
                <div className="text-2xl font-semibold text-gray-900">100+</div>
                <div className="text-sm text-gray-600">Products</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">24/7</div>
                <div className="text-sm text-gray-600">Support</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">Fast</div>
                <div className="text-sm text-gray-600">Shipping</div>
              </div>
            </motion.div>
          </div>

          {/* Image Grid */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={imageVariants}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                className="space-y-4"
                initial={{ y: 0 }}
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="aspect-[4/5] bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-20 h-20 text-gray-400" />
                  </div>
                </div>
                <div className="aspect-square bg-gradient-to-br from-gray-300 to-gray-400 rounded-2xl overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-16 h-16 text-gray-500" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="space-y-4 pt-8"
                initial={{ y: 0 }}
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="aspect-square bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-16 h-16 text-gray-600" />
                  </div>
                </div>
                <div className="aspect-[4/5] bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-20 h-20 text-gray-400" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Decorative Elements */}
            <motion.div
              className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400/20 rounded-full blur-2xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 2,
              }}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2 text-gray-400"
        >
          <span className="text-xs font-medium">Scroll to explore</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  )
}
