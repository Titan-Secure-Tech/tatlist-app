import twilio from 'twilio'
import { mailgunService } from '@/lib/email/mailgun'
import { createClient } from '@/lib/supabase/server'

type OrderStatus =
  | 'pending'
  | 'processing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled'

type ContactPreference = 'sms' | 'email' | 'both'

interface OrderNotificationData {
  orderId: string
  userId: string
  status: OrderStatus
  message?: string
  estimatedTime?: string
}

export class NotificationService {
  private twilioClient: twilio.Twilio | null = null
  private twilioPhoneNumber: string

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || ''

    if (accountSid && authToken) {
      this.twilioClient = twilio(accountSid, authToken)
    } else {
      console.warn('Twilio credentials not configured. SMS notifications will not be sent.')
    }
  }

  /**
   * Send SMS notification via Twilio
   */
  private async sendSMS(to: string, message: string): Promise<boolean> {
    if (!this.twilioClient) {
      console.log('Twilio not configured. Skipping SMS to:', to)
      return false
    }

    try {
      const result = await this.twilioClient.messages.create({
        body: message,
        from: this.twilioPhoneNumber,
        to,
      })
      console.log('SMS sent successfully:', result.sid)
      return true
    } catch (error) {
      console.error('Failed to send SMS:', error)
      return false
    }
  }

  /**
   * Generate SMS message for order status update
   */
  private generateSMSMessage(orderData: {
    orderId: string
    status: OrderStatus
    customerName: string
    message?: string
  }): string {
    const orderNumber = orderData.orderId.slice(0, 8).toUpperCase()

    const statusMessages: Record<OrderStatus, string> = {
      pending: "We've received your order and will process it soon.",
      processing: 'Your order is being processed.',
      ready_for_pickup: 'Your order is ready for pickup!',
      out_for_delivery: 'Your order is out for delivery!',
      delivered: 'Your order has been delivered.',
      completed: 'Your order is complete. Thank you!',
      cancelled: 'Your order has been cancelled.',
    }

    let message = `Hi ${orderData.customerName}, Order #${orderNumber}: ${statusMessages[orderData.status]}`

    if (orderData.message) {
      message += ` ${orderData.message}`
    }

    message += ' - Tatlist'

    return message
  }

  /**
   * Send order status notification to a user
   * Respects user's contact preference (sms, email, or both)
   */
  async sendOrderStatusNotification(data: OrderNotificationData): Promise<{
    emailSent: boolean
    smsSent: boolean
  }> {
    const supabase = await createClient()

    // Fetch user data with contact preference and phone
    const { data: user, error } = await supabase
      .from('users')
      .select('email, first_name, last_name, phone, contact_preference')
      .eq('id', data.userId)
      .single()

    if (error || !user) {
      console.error('Failed to fetch user data:', error)
      return { emailSent: false, smsSent: false }
    }

    const contactPreference = (user.contact_preference as ContactPreference) || 'email'
    const customerName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Customer'

    let emailSent = false
    let smsSent = false

    // Send email if preference is email or both
    if (contactPreference === 'email' || contactPreference === 'both') {
      if (user.email) {
        emailSent = await mailgunService.sendOrderStatusUpdate(user.email, {
          orderId: data.orderId,
          customerName,
          status: data.status,
          message: data.message,
          estimatedTime: data.estimatedTime,
        })
      }
    }

    // Send SMS if preference is sms or both
    if (contactPreference === 'sms' || contactPreference === 'both') {
      if (user.phone) {
        const smsMessage = this.generateSMSMessage({
          orderId: data.orderId,
          status: data.status,
          customerName,
          message: data.message,
        })
        smsSent = await this.sendSMS(user.phone, smsMessage)
      } else {
        console.warn(`User ${data.userId} has SMS preference but no phone number`)
      }
    }

    return { emailSent, smsSent }
  }

  /**
   * Send order confirmation notification
   */
  async sendOrderConfirmation(orderData: {
    orderId: string
    userId: string
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
  }): Promise<boolean> {
    const supabase = await createClient()

    // Fetch user data
    const { data: user, error } = await supabase
      .from('users')
      .select('email, first_name, last_name, phone, contact_preference')
      .eq('id', orderData.userId)
      .single()

    if (error || !user || !user.email) {
      console.error('Failed to fetch user data for order confirmation:', error)
      return false
    }

    const customerName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Customer'
    const contactPreference = (user.contact_preference as ContactPreference) || 'email'

    let emailSent = false
    let smsSent = false

    // Always send email for order confirmation (or based on preference)
    if (contactPreference === 'email' || contactPreference === 'both') {
      emailSent = await mailgunService.sendOrderConfirmation(user.email, {
        ...orderData,
        customerName,
      })
    }

    // Send SMS confirmation if preferred
    if (contactPreference === 'sms' || contactPreference === 'both') {
      if (user.phone) {
        const orderNumber = orderData.orderId.slice(0, 8).toUpperCase()
        const smsMessage = `Hi ${customerName}, your order #${orderNumber} has been confirmed! Total: $${orderData.total.toFixed(2)}. You'll receive updates as your order progresses. - Tatlist`
        smsSent = await this.sendSMS(user.phone, smsMessage)
      }
    }

    return emailSent || smsSent
  }
}

export const notificationService = new NotificationService()
