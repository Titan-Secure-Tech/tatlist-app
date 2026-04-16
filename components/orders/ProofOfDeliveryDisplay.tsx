'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FileCheck, User, MessageSquare, X } from 'lucide-react'

interface ProofOfDeliveryDisplayProps {
  proof: {
    photo_url: string | null
    signature_data: string | null
    recipient_name: string | null
    delivery_notes: string | null
    delivered_at: string | null
  }
}

export function ProofOfDeliveryDisplay({ proof }: ProofOfDeliveryDisplayProps) {
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [showSignatureModal, setShowSignatureModal] = useState(false)

  if (!proof.photo_url && !proof.signature_data && !proof.recipient_name) {
    return null
  }

  return (
    <div className="bg-background border border-border rounded-xl p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <FileCheck className="h-5 w-5" />
        Proof of Delivery
      </h2>

      <div className="space-y-4">
        {/* Recipient Name */}
        {proof.recipient_name && (
          <div>
            <p className="text-sm font-medium text-foreground mb-1 flex items-center gap-2">
              <User className="h-4 w-4" />
              Received By
            </p>
            <p className="text-base font-semibold text-foreground">{proof.recipient_name}</p>
          </div>
        )}

        {/* Delivery Time */}
        {proof.delivered_at && (
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Delivered At</p>
            <p className="text-base text-foreground">
              {new Date(proof.delivered_at).toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          </div>
        )}

        {/* Photo */}
        {proof.photo_url && (
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Delivery Photo</p>
            <button
              onClick={() => setShowPhotoModal(true)}
              className="relative w-full h-48 rounded-lg overflow-hidden border border-border hover:border-foreground/40 transition-colors"
            >
              <Image
                src={proof.photo_url}
                alt="Delivery proof photo"
                fill
                className="object-cover"
              />
            </button>
          </div>
        )}

        {/* Signature */}
        {proof.signature_data && (
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Customer Signature</p>
            <button
              onClick={() => setShowSignatureModal(true)}
              className="relative w-full h-32 rounded-lg overflow-hidden border border-border hover:border-foreground/40 transition-colors bg-background"
            >
              <Image
                src={proof.signature_data}
                alt="Customer signature"
                fill
                className="object-contain p-2"
              />
            </button>
          </div>
        )}

        {/* Delivery Notes */}
        {proof.delivery_notes && (
          <div>
            <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Delivery Notes
            </p>
            <div className="p-3 bg-muted rounded-md text-sm text-foreground">
              {proof.delivery_notes}
            </div>
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {showPhotoModal && proof.photo_url && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={() => setShowPhotoModal(false)}
        >
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setShowPhotoModal(false)}
              className="absolute top-4 right-4 p-2 bg-background rounded-full hover:bg-accent transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
              <Image
                src={proof.photo_url}
                alt="Delivery proof photo"
                fill
                className="object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Signature Modal */}
      {showSignatureModal && proof.signature_data && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={() => setShowSignatureModal(false)}
        >
          <div className="relative max-w-2xl w-full bg-background rounded-xl p-4">
            <button
              onClick={() => setShowSignatureModal(false)}
              className="absolute top-4 right-4 p-2 bg-secondary rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative w-full h-96">
              <Image
                src={proof.signature_data}
                alt="Customer signature"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
