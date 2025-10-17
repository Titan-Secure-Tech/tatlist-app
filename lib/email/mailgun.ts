import { render } from '@react-email/components'
import { OrderConfirmation } from './templates/OrderConfirmation'
import { OrderStatusUpdate } from './templates/OrderStatusUpdate'
import { ContactForm } from './templates/ContactForm'

interface EmailConfig {
  to: string | string[]
  subject: string
  text?: string
  html?: string
  template?: string
  variables?: Record<string, unknown>
  replyTo?: string
  from?: string
}

export class MailgunService {
  private baseUrl: string
  private domain: string
  private apiKey: string
  private from: string

  constructor() {
    this.baseUrl = process.env.MAILGUN_BASE_URL || 'https://api.mailgun.net'
    this.domain = process.env.MAILGUN_DOMAIN || ''
    this.apiKey = process.env.MAILGUN_SENDING_KEY || process.env.SMTP_PASSWORD || '' // Use MAILGUN_SENDING_KEY (private API key)
    this.from = `Tatlist <noreply@${this.domain}>`

    if (!this.domain || !this.apiKey) {
      console.warn('Mailgun credentials not configured. Emails will not be sent.')
    }
  }

  async sendEmail(config: EmailConfig): Promise<boolean> {
    if (!this.domain || !this.apiKey) {
      console.log('Mailgun not configured. Skipping email:', config.subject)
      return false
    }

    try {
      const formData = new FormData()
      formData.append('from', config.from || this.from)
      formData.append('to', Array.isArray(config.to) ? config.to.join(',') : config.to)
      formData.append('subject', config.subject)

      if (config.replyTo) {
        formData.append('h:Reply-To', config.replyTo)
      }

      if (config.text) {
        formData.append('text', config.text)
      }

      if (config.html) {
        formData.append('html', config.html)
      }

      if (config.template) {
        formData.append('template', config.template)
        if (config.variables) {
          formData.append('h:X-Mailgun-Variables', JSON.stringify(config.variables))
        }
      }

      const response = await fetch(`${this.baseUrl}/v3/${this.domain}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`api:${this.apiKey}`).toString('base64')}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('Mailgun error:', error)
        return false
      }

      const result = await response.json()
      console.log('Email sent successfully:', result.id)
      return true
    } catch (error) {
      console.error('Failed to send email:', error)
      return false
    }
  }

  async sendOrderConfirmation(
    to: string,
    orderData: {
      orderId: string
      customerName: string
      items: Array<{ name: string; quantity: number; price: number }>
      subtotal: number
      deliveryFee: number
      tax: number
      total: number
      deliveryAddress: {
        line1: string
        line2?: string
        city: string
        state: string
        postalCode: string
      }
    }
  ): Promise<boolean> {
    const html = await render(
      OrderConfirmation({
        orderId: orderData.orderId,
        customerName: orderData.customerName,
        items: orderData.items,
        subtotal: orderData.subtotal,
        deliveryFee: orderData.deliveryFee,
        tax: orderData.tax,
        total: orderData.total,
        deliveryAddress: orderData.deliveryAddress,
      })
    )

    return this.sendEmail({
      to,
      subject: `Order Confirmation - #${orderData.orderId.slice(0, 8).toUpperCase()}`,
      html,
      text: `Order confirmation for order #${orderData.orderId.slice(0, 8).toUpperCase()}. Total: $${orderData.total.toFixed(2)}`,
      from: `Tatlist Orders <orders@${this.domain}>`,
      replyTo: 'support@tatlist.com',
    })
  }

  async sendOrderStatusUpdate(
    to: string,
    orderData: {
      orderId: string
      customerName: string
      status: 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled'
      message?: string
      estimatedTime?: string
    }
  ): Promise<boolean> {
    const statusMessages = {
      preparing: 'Your order is being prepared',
      ready: 'Your order is ready for delivery',
      out_for_delivery: 'Your order is out for delivery',
      delivered: 'Your order has been delivered',
      cancelled: 'Your order has been cancelled',
    }

    const html = await render(
      OrderStatusUpdate({
        orderId: orderData.orderId,
        customerName: orderData.customerName,
        status: orderData.status,
        message: orderData.message,
        estimatedTime: orderData.estimatedTime,
      })
    )

    return this.sendEmail({
      to,
      subject: `Order Update - #${orderData.orderId.slice(0, 8).toUpperCase()} - ${statusMessages[orderData.status]}`,
      html,
      text: `Order #${orderData.orderId.slice(0, 8).toUpperCase()} status: ${statusMessages[orderData.status]}`,
      from:
        orderData.status === 'out_for_delivery'
          ? `Tatlist Delivery <delivery@${this.domain}>`
          : `Tatlist Orders <orders@${this.domain}>`,
      replyTo: 'support@tatlist.com',
    })
  }

  async sendContactFormEmail(contactData: {
    name: string
    email: string
    phone?: string
    subject: string
    message: string
  }): Promise<boolean> {
    const html = await render(
      ContactForm({
        name: contactData.name,
        email: contactData.email,
        phone: contactData.phone,
        subject: contactData.subject,
        message: contactData.message,
      })
    )

    return this.sendEmail({
      to: 'support@tatlist.com',
      subject: `Contact Form: ${contactData.subject}`,
      html,
      text: `New contact form submission from ${contactData.name} (${contactData.email}): ${contactData.message}`,
      from: `Tatlist Contact Form <noreply@${this.domain}>`,
      replyTo: contactData.email,
    })
  }

  async sendPrivacyInquiry(inquiryData: {
    name: string
    email: string
    subject: string
    message: string
  }): Promise<boolean> {
    const html = await render(
      ContactForm({
        name: inquiryData.name,
        email: inquiryData.email,
        subject: inquiryData.subject,
        message: inquiryData.message,
      })
    )

    return this.sendEmail({
      to: 'privacy@tatlist.com',
      subject: `Privacy Inquiry: ${inquiryData.subject}`,
      html,
      text: `Privacy inquiry from ${inquiryData.name} (${inquiryData.email}): ${inquiryData.message}`,
      from: `Tatlist Privacy <noreply@${this.domain}>`,
      replyTo: inquiryData.email,
    })
  }
}

export const mailgunService = new MailgunService()
