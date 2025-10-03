'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  ArrowRight, 
  Truck, 
  MapPin, 
  Clock, 
  Shield, 
  CheckCircle,
  Zap,
  Package,
  CreditCard,
  Download,
  Copy
} from 'lucide-react'
import { useState } from 'react'
import { Logo } from '@/components/ui/logo'

export default function FeaturesPage() {
  const [logoDropdownOpen, setLogoDropdownOpen] = useState(false)

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // TODO: Add toast notification
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Simple SVG logo based on the text logo
  const svgLogo = `<svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <text x="10" y="28" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#000000">Tatlist</text>
</svg>`

  const pngDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAoCAYAAAA16j4lAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAANCSURBVHhe7ZrPaxNBFMdfQi1YwYMHD4IHD/4Bb+LBg3jw4EGwYMGCBQsWLFiwYMGCBQsWLFiwYMGCBQsWLFiwYMGCBQsWLFiwYMGCBQsWLFiwYMGCBQsWLFiwYMGCBQsWLFiwYMGCBQsWLFiwYMGCBQsWLFiwYMGCBQsWLFiwYMGCBQsWLFiwYMGCBQsWLFiwYMGCBQsWLFiwYMGCBQsWLFiwYMGCBQsWLFjw/8EwDMMwDMMwDMMwDMMwDMMwDMMwDMMwDMMwDMMwDMMwDMMwDMMwDMMwDMMwDMMwDMMwDMMwDMMwDMMwDMMwDMMwjP8FY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/'

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Logo />
            <div className="relative">
              <button
                onClick={() => setLogoDropdownOpen(!logoDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Brand Assets
              </button>
              
              {logoDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        copyToClipboard(svgLogo, 'SVG')
                        setLogoDropdownOpen(false)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Logo as SVG
                    </button>
                    <button
                      onClick={() => {
                        downloadFile(svgLogo, 'tatlist-logo.svg', 'image/svg+xml')
                        setLogoDropdownOpen(false)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Logo as SVG
                    </button>
                    <button
                      onClick={() => {
                        // Create a download link for PNG
                        const link = document.createElement('a')
                        link.href = '/logo.webp'
                        link.download = 'tatlist-logo.png'
                        link.click()
                        setLogoDropdownOpen(false)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Logo as PNG
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <motion.div
        className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 text-sm font-medium text-gray-700 mb-6"
            >
              <Zap className="w-4 h-4" />
              Professional Tattoo Supply Solutions
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl lg:text-7xl font-light text-gray-900 mb-6 leading-tight"
            >
              How Tatlist
              <span className="block font-normal">Works for You</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto"
            >
              Tampa Bay's premier tattoo supply platform combining cutting-edge technology 
              with professional-grade products for licensed tattoo artists.
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Business Hours */}
      <motion.div
        className="bg-black text-white py-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-5 h-5" />
            <span className="font-medium">Hours: Monday - Saturday, 9:00 AM - 6:00 PM</span>
          </div>
        </div>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        className="py-24 bg-white"
        initial="hidden"
        whileInView="visible"
        variants={containerVariants}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl font-light text-gray-900 mb-4">
              Advanced Features & Benefits
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the future of tattoo supply management with our integrated platform
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* FireCrawl Integration */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border border-blue-100"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Real-Time Product Data
              </h3>
              <p className="text-gray-600 mb-4">
                Our breakthrough FireCrawl AI integration delivers real-time Lucky Supply data 
                with 2-23 images per product, complete variant information, and 100% success rate.
              </p>
              <div className="flex items-center gap-2 text-blue-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                128 Products Available
              </div>
            </motion.div>

            {/* Square Integration */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl border border-green-100"
            >
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-6">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Secure Payment Processing
              </h3>
              <p className="text-gray-600 mb-4">
                Complete Square integration with order tracking, payment confirmations, 
                Apple Pay support, and webhook handlers for seamless transactions.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Apple Pay Ready
                </div>
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Secure Webhooks
                </div>
              </div>
            </motion.div>

            {/* Delivery Validation */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border border-purple-100"
            >
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-6">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Smart Delivery Zones
              </h3>
              <p className="text-gray-600 mb-4">
                Mapbox integration for address validation, 25-mile delivery radius from Tampa, 
                and business verification for licensed tattoo shops only.
              </p>
              <div className="flex items-center gap-2 text-purple-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                25-Mile Radius Coverage
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* How It Works */}
      <motion.div
        className="py-24 bg-gray-50"
        initial="hidden"
        whileInView="visible"
        variants={containerVariants}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl font-light text-gray-900 mb-4">
              Simple Process, Professional Results
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From browsing to delivery, every step is designed for professional tattoo artists
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-8">
            <motion.div variants={itemVariants} className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Browse Products</h3>
              <p className="text-gray-600">
                Access 128 professional tattoo supplies with detailed images and specifications
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Verify Business</h3>
              <p className="text-gray-600">
                Enter your tattoo shop license and address for validation within our delivery zone
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Secure Payment</h3>
              <p className="text-gray-600">
                Complete your order with Square's secure payment processing and Apple Pay
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">4</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Fast Delivery</h3>
              <p className="text-gray-600">
                Same-day delivery to licensed shops within 25 miles of Tampa center
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Technical Features */}
      <motion.div
        className="py-24 bg-white"
        initial="hidden"
        whileInView="visible"
        variants={containerVariants}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl font-light text-gray-900 mb-4">
              Built on Modern Technology
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Next.js 15, TypeScript, Tailwind CSS v4, and enterprise integrations
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div variants={itemVariants}>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Platform Features</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900">Supabase Authentication</h4>
                    <p className="text-gray-600">OAuth (Google) and email/password with session management</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900">Real-time Inventory</h4>
                    <p className="text-gray-600">Live product sync with advanced state management using Zustand</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900">Mobile Optimized</h4>
                    <p className="text-gray-600">Responsive design with Tailwind CSS v4 and mobile-first approach</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Professional Benefits</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900">Licensed Artists Only</h4>
                    <p className="text-gray-600">Strict verification process ensures professional-grade service</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900">Local Tampa Focus</h4>
                    <p className="text-gray-600">Serving Tampa, St. Petersburg, Clearwater, and Hillsborough County</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900">Complete Catalog</h4>
                    <p className="text-gray-600">Inks, needles, machines, studio supplies, and hygiene products</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        className="py-24 bg-black text-white"
        initial="hidden"
        whileInView="visible"
        variants={containerVariants}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            variants={itemVariants}
            className="text-4xl font-light mb-6"
          >
            Ready to Elevate Your Tattoo Shop?
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
          >
            Join Tampa Bay's leading tattoo artists who trust Tatlist for their professional supply needs.
          </motion.p>
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/login">
              <motion.button
                className="group px-8 py-4 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Today
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            <Link href="/shop">
              <motion.button
                className="px-8 py-4 border border-white text-white rounded-lg font-medium hover:bg-white hover:text-black transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Browse Products
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}