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
    const itemsHtml = orderData.items
      .map(
        item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
      </tr>
    `
      )
      .join('')

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #000; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; }
            .total-row { font-weight: bold; font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmation</h1>
            </div>
            <div class="content">
              <p>Hi ${orderData.customerName},</p>
              <p>Thank you for your order! We've received your order and it's being prepared for delivery.</p>
              
              <div class="order-details">
                <h2>Order #${orderData.orderId.slice(0, 8).toUpperCase()}</h2>
                
                <h3>Items Ordered:</h3>
                <table>
                  <thead>
                    <tr>
                      <th style="text-align: left; padding: 8px;">Item</th>
                      <th style="text-align: center; padding: 8px;">Quantity</th>
                      <th style="text-align: right; padding: 8px;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>
                
                <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #eee;">
                  <table>
                    <tr>
                      <td>Subtotal:</td>
                      <td style="text-align: right;">$${orderData.subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td>Delivery Fee:</td>
                      <td style="text-align: right;">$${orderData.deliveryFee.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td>Tax:</td>
                      <td style="text-align: right;">$${orderData.tax.toFixed(2)}</td>
                    </tr>
                    <tr class="total-row">
                      <td style="padding-top: 10px;">Total:</td>
                      <td style="text-align: right; padding-top: 10px;">$${orderData.total.toFixed(2)}</td>
                    </tr>
                  </table>
                </div>
                
                <div style="margin-top: 20px;">
                  <h3>Delivery Address:</h3>
                  <p>
                    ${orderData.deliveryAddress.line1}<br>
                    ${orderData.deliveryAddress.line2 ? orderData.deliveryAddress.line2 + '<br>' : ''}
                    ${orderData.deliveryAddress.city}, ${orderData.deliveryAddress.state} ${orderData.deliveryAddress.postalCode}
                  </p>
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background-color: #f0f8ff; border-radius: 5px;">
                  <h3>What's Next?</h3>
                  <ul>
                    <li>Your order is being prepared</li>
                    <li>You'll receive an update when it's out for delivery</li>
                    <li>Estimated delivery time: Within 3 hours</li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="footer">
              <p><strong>Questions about your order?</strong></p>
              <p>📧 support@tatlist.com | 📞 813-310-3877</p>
              <p style="margin-top: 10px; font-size: 11px; color: #999;">&copy; 2025 Tatlist. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `

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

    const statusColors = {
      preparing: '#FFA500',
      ready: '#4CAF50',
      out_for_delivery: '#2196F3',
      delivered: '#4CAF50',
      cancelled: '#F44336',
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #000; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .status-box { 
              background: white; 
              padding: 30px; 
              margin: 20px 0; 
              border-radius: 8px; 
              text-align: center;
              border-left: 5px solid ${statusColors[orderData.status]};
            }
            .status-badge {
              display: inline-block;
              padding: 10px 20px;
              background-color: ${statusColors[orderData.status]};
              color: white;
              border-radius: 25px;
              font-weight: bold;
              text-transform: uppercase;
              margin: 10px 0;
            }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Status Update</h1>
            </div>
            <div class="content">
              <p>Hi ${orderData.customerName},</p>
              
              <div class="status-box">
                <h2>Order #${orderData.orderId.slice(0, 8).toUpperCase()}</h2>
                <div class="status-badge">${orderData.status.replace(/_/g, ' ')}</div>
                <h3>${statusMessages[orderData.status]}</h3>
                ${orderData.message ? `<p>${orderData.message}</p>` : ''}
                ${orderData.estimatedTime ? `<p><strong>Estimated time:</strong> ${orderData.estimatedTime}</p>` : ''}
              </div>
              
              ${
                orderData.status === 'out_for_delivery'
                  ? `
                <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p><strong>Your delivery is on the way!</strong></p>
                  <p>Please ensure someone is available to receive the order.</p>
                </div>
              `
                  : ''
              }
              
              ${
                orderData.status === 'delivered'
                  ? `
                <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p><strong>Thank you for your order!</strong></p>
                  <p>We hope you enjoy your products. Feel free to order again anytime.</p>
                </div>
              `
                  : ''
              }
              
              ${
                orderData.status === 'cancelled'
                  ? `
                <div style="background: #ffebee; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p><strong>We're sorry your order was cancelled.</strong></p>
                  <p>If you have any questions, please contact our support team.</p>
                </div>
              `
                  : ''
              }
            </div>
            <div class="footer">
              <p><strong>Questions about your order?</strong></p>
              <p>📧 support@tatlist.com | 📞 813-310-3877</p>
              <p style="margin-top: 10px; font-size: 11px; color: #999;">&copy; 2025 Tatlist. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `

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
}

export const mailgunService = new MailgunService()
