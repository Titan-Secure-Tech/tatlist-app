'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const [submitState, setSubmitState] = useState<{
    isSubmitting: boolean
    isSuccess: boolean
    error: string | null
  }>({
    isSubmitting: false,
    isSuccess: false,
    error: null,
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setSubmitState({
      isSubmitting: true,
      isSuccess: false,
      error: null,
    })

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitState({
          isSubmitting: false,
          isSuccess: true,
          error: null,
        })
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
        })
      } else {
        const errorData = await response.json()
        setSubmitState({
          isSubmitting: false,
          isSuccess: false,
          error: errorData.error || 'Failed to send message. Please try again.',
        })
      }
    } catch {
      setSubmitState({
        isSubmitting: false,
        isSuccess: false,
        error: 'Failed to send message. Please try again.',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Your name"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your@email.com"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="subject">
            Subject <span className="text-red-500">*</span>
          </Label>
          <Input
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            placeholder="What is your inquiry about?"
            required
          />
        </div>

        <div>
          <Label htmlFor="message">
            Message <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            placeholder="Please provide details about your inquiry..."
            rows={6}
            required
          />
        </div>
      </div>

      {submitState.isSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Thank you for your message! We'll get back to you soon.
          </AlertDescription>
        </Alert>
      )}

      {submitState.error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            {submitState.error}
          </AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={submitState.isSubmitting}
        className="w-full"
      >
        {submitState.isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending Message...
          </>
        ) : (
          'Send Message'
        )}
      </Button>
    </form>
  )
}