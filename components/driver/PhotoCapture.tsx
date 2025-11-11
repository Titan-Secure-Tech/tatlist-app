'use client'

import { useState, useRef } from 'react'
import { Camera, X, RotateCcw, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface PhotoCaptureProps {
  onPhotoCapture: (file: File) => void
  label?: string
}

export function PhotoCapture({ onPhotoCapture, label = 'Delivery Photo' }: PhotoCaptureProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use rear camera on mobile
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setCameraActive(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Unable to access camera. Please check permissions or use file upload.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current) return

    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const context = canvas.getContext('2d')
    if (!context) return

    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(
      blob => {
        if (!blob) return

        const file = new File([blob], `delivery-proof-${Date.now()}.jpg`, { type: 'image/jpeg' })
        const imageUrl = URL.createObjectURL(blob)

        setCapturedImage(imageUrl)
        onPhotoCapture(file)
        stopCamera()
      },
      'image/jpeg',
      0.9
    )
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    startCamera()
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const imageUrl = URL.createObjectURL(file)
    setCapturedImage(imageUrl)
    onPhotoCapture(file)
  }

  const removePhoto = () => {
    setCapturedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {!capturedImage && !cameraActive && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={startCamera}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
          >
            <Camera className="h-5 w-5 text-gray-600" />
            <span className="text-gray-700 font-medium">Take Photo</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
          >
            <ImageIcon className="h-5 w-5 text-gray-600" />
            <span className="text-gray-700 font-medium">Upload from Gallery</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {cameraActive && (
        <div className="space-y-3">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-auto"
              style={{ maxHeight: '400px' }}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={stopCamera}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={capturePhoto}
              className="flex-1 px-4 py-2 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <Camera className="h-4 w-4" />
              Capture
            </button>
          </div>
        </div>
      )}

      {capturedImage && (
        <div className="space-y-3">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={capturedImage}
              alt="Captured delivery proof"
              width={400}
              height={300}
              className="w-full h-auto"
              style={{ maxHeight: '400px', objectFit: 'contain' }}
            />
            <button
              type="button"
              onClick={removePhoto}
              className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={retakePhoto}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Retake Photo
          </button>
        </div>
      )}
    </div>
  )
}
