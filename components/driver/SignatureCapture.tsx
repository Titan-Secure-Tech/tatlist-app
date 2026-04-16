'use client'

import { useState, useRef, useEffect } from 'react'
import { Pencil, RotateCcw, X } from 'lucide-react'

interface SignatureCaptureProps {
  onSignatureCapture: (signatureData: string) => void
  label?: string
}

export function SignatureCapture({
  onSignatureCapture,
  label = 'Customer Signature',
}: SignatureCaptureProps) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null)

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      if (context) {
        // Set canvas size
        canvas.width = canvas.offsetWidth
        canvas.height = 200

        // Configure drawing style
        context.strokeStyle = '#000000'
        context.lineWidth = 2
        context.lineCap = 'round'
        context.lineJoin = 'round'

        setCtx(context)
      }
    }
  }, [])

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!ctx || !canvasRef.current) return

    setIsDrawing(true)
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()

    let x, y

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx || !canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()

    let x, y

    if ('touches' in e) {
      e.preventDefault()
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    ctx.lineTo(x, y)
    ctx.stroke()
    setHasSignature(true)
  }

  const stopDrawing = () => {
    if (!isDrawing || !canvasRef.current) return

    setIsDrawing(false)

    // Get signature as base64 data URL
    const signatureData = canvasRef.current.toDataURL('image/png')
    onSignatureCapture(signatureData)
  }

  const clearSignature = () => {
    if (!ctx || !canvasRef.current) return

    const canvas = canvasRef.current
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
    onSignatureCapture('')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-foreground">{label}</label>
        {hasSignature && (
          <button
            type="button"
            onClick={clearSignature}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      <div className="relative border-2 border-border rounded-xl overflow-hidden bg-background">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full cursor-crosshair touch-none"
          style={{ height: '200px' }}
        />

        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Pencil className="h-5 w-5" />
              <span className="text-sm">Sign here</span>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">Draw your signature using your finger or mouse</p>
    </div>
  )
}
