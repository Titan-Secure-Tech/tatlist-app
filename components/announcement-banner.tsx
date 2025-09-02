'use client'

import { useState, useEffect } from 'react'
import { X, Truck, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const [hasBeenClosed, setHasBeenClosed] = useState(false)

  useEffect(() => {
    // Check if banner was previously closed in this session
    const closed = sessionStorage.getItem('announcementBannerClosed')
    if (closed === 'true') {
      setIsVisible(false)
      setHasBeenClosed(true)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setHasBeenClosed(true)
    sessionStorage.setItem('announcementBannerClosed', 'true')
  }

  if (hasBeenClosed) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="sticky top-0 z-50 bg-gradient-to-r from-black via-gray-900 to-black text-white overflow-hidden"
        >
          <div className="relative">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)`,
                }}
              />
            </div>

            <div className="relative px-4 py-3">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex-1 flex items-center justify-center space-x-8">
                  {/* Square Payment */}
                  <motion.div
                    className="flex items-center space-x-2"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="bg-white p-1 rounded">
                      <svg viewBox="0 0 44 44" className="w-5 h-5">
                        <path
                          fill="#000"
                          d="M36.65 0h-29.296c-4.061 0-7.354 3.292-7.354 7.354v29.296c0 4.062 3.293 7.354 7.354 7.354h29.296c4.062 0 7.354-3.292 7.354-7.354v-29.296c.001-4.062-3.291-7.354-7.354-7.354zm-17.969 33.744c0 1.282-1.039 2.32-2.32 2.32s-2.32-1.038-2.32-2.32v-10.624c0-1.282 1.039-2.32 2.32-2.32s2.32 1.038 2.32 2.32v10.624zm10.624 0c0 1.282-1.038 2.32-2.32 2.32s-2.32-1.038-2.32-2.32v-10.624c0-1.282 1.038-2.32 2.32-2.32s2.32 1.038 2.32 2.32v10.624z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">Secure payments via Square</span>
                  </motion.div>

                  {/* Separator */}
                  <div className="hidden sm:block w-px h-6 bg-white/20" />

                  {/* Delivery Area */}
                  <motion.div
                    className="flex items-center space-x-2"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Truck className="w-5 h-5 text-green-400" />
                    <span className="text-sm font-medium">Fast delivery in Tampa, FL area</span>
                    <MapPin className="w-4 h-4 text-green-400" />
                  </motion.div>

                  {/* Separator */}
                  <div className="hidden sm:block w-px h-6 bg-white/20" />

                  {/* Delivery Time */}
                  <motion.div
                    className="hidden md:flex items-center space-x-2"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center space-x-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span className="text-sm font-medium text-green-400">
                        Under 3 hour delivery
                      </span>
                    </div>
                  </motion.div>
                </div>

                {/* Close button */}
                <motion.button
                  onClick={handleClose}
                  className="ml-4 p-1 rounded-full hover:bg-white/10 transition-colors"
                  initial={{ rotate: 0 }}
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.2 }}
                  aria-label="Close announcement"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Mobile view - second row */}
              <motion.div
                className="md:hidden mt-2 flex items-center justify-center space-x-2"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-sm font-medium text-green-400">Under 60 min delivery</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
