'use client'

import { useState } from 'react'
import { X, Loader2, CheckCircle } from 'lucide-react'
import { PhotoCapture } from './PhotoCapture'
import { SignatureCapture } from './SignatureCapture'

interface ProofOfDeliveryModalProps {
  deliveryId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ProofOfDeliveryModal({
  deliveryId,
  isOpen,
  onClose,
  onSuccess,
}: ProofOfDeliveryModalProps) {
  const [photo, setPhoto] = useState<File | null>(null)
  const [signatureData, setSignatureData] = useState<string>('')
  const [recipientName, setRecipientName] = useState('')
  const [deliveryNotes, setDeliveryNotes] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!photo) {
      setError('Please capture a photo of the delivery')
      return
    }

    if (!signatureData) {
      setError('Please capture the recipient signature')
      return
    }

    if (!recipientName.trim()) {
      setError('Please enter the recipient name')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('photo', photo)
      formData.append('signatureData', signatureData)
      formData.append('recipientName', recipientName.trim())
      if (deliveryNotes.trim()) {
        formData.append('deliveryNotes', deliveryNotes.trim())
      }

      const response = await fetch(`/api/driver/deliveries/${deliveryId}/proof`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload proof of delivery')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload proof of delivery')
    } finally {
      setUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-black">Proof of Delivery</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={uploading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Photo Capture */}
          <PhotoCapture onPhotoCapture={setPhoto} />

          {/* Signature Capture */}
          <SignatureCapture onSignatureCapture={setSignatureData} />

          {/* Recipient Name */}
          <div>
            <label
              htmlFor="recipient-name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Recipient Name *
            </label>
            <input
              id="recipient-name"
              type="text"
              value={recipientName}
              onChange={e => setRecipientName(e.target.value)}
              placeholder="Enter name of person who received delivery"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
              disabled={uploading}
              required
            />
          </div>

          {/* Delivery Notes */}
          <div>
            <label
              htmlFor="delivery-notes"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Delivery Notes (Optional)
            </label>
            <textarea
              id="delivery-notes"
              value={deliveryNotes}
              onChange={e => setDeliveryNotes(e.target.value)}
              placeholder="Add any additional notes about the delivery..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
              disabled={uploading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Complete Delivery
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
