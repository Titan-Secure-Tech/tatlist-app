'use client'

import { useOfficeStatus } from '@/hooks/use-office-status'
import { AlertCircle, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function OfficeStatusBanner() {
  const { isOpen, message, hours } = useOfficeStatus()

  // Don't show banner when open
  if (isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="relative bg-amber-50 border-b border-amber-200"
      >
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3 text-amber-900">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 text-center sm:text-left">
              <p className="font-medium">{message}</p>
              <span className="hidden sm:inline text-amber-700">•</span>
              <p className="text-sm flex items-center justify-center sm:justify-start gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{hours}</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
