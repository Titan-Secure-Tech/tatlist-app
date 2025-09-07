'use client'

import { useEffect } from 'react'
import confetti from 'canvas-confetti'

export default function PaymentSuccessConfetti() {
  useEffect(() => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }, [])
  
  return null
}