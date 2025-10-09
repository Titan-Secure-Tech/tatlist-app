import { NextRequest, NextResponse } from 'next/server'
import { render } from '@react-email/components'
import { OrderConfirmation } from '@/lib/email/templates/OrderConfirmation'
import { OrderStatusUpdate } from '@/lib/email/templates/OrderStatusUpdate'
import { ContactForm } from '@/lib/email/templates/ContactForm'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const template = searchParams.get('template') || 'order-confirmation'

  let emailHtml: string

  try {
    switch (template) {
      case 'order-confirmation':
        emailHtml = await render(
          OrderConfirmation({
            orderId: 'preview-order-12345',
            customerName: 'John Doe',
            items: [
              {
                name: 'Professional Tattoo Machine',
                quantity: 1,
                price: 299.99,
              },
              { name: 'Ink Set - Premium Colors', quantity: 2, price: 49.99 },
              {
                name: 'Disposable Needles Pack',
                quantity: 3,
                price: 29.99,
              },
            ],
            subtotal: 489.95,
            deliveryFee: 15.0,
            tax: 42.5,
            total: 547.45,
            deliveryAddress: {
              line1: '123 Main Street',
              line2: 'Suite 400',
              city: 'Tampa',
              state: 'FL',
              postalCode: '33601',
            },
          })
        )
        break

      case 'order-status':
        const status = (searchParams.get('status') || 'preparing') as
          | 'preparing'
          | 'ready'
          | 'out_for_delivery'
          | 'delivered'
          | 'cancelled'
        emailHtml = await render(
          OrderStatusUpdate({
            orderId: 'preview-order-12345',
            customerName: 'John Doe',
            status,
            message: 'This is a preview of the status update email',
            estimatedTime: '30 minutes',
          })
        )
        break

      case 'contact-form':
        emailHtml = await render(
          ContactForm({
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '(555) 123-4567',
            subject: 'Question about product availability',
            message:
              'Hi there,\n\nI was wondering if you have the Professional Tattoo Machine in stock? I noticed it shows as available on your website, but I wanted to confirm before placing an order.\n\nThanks!',
          })
        )
        break

      default:
        return NextResponse.json({ error: 'Invalid template' }, { status: 400 })
    }

    // Return the rendered HTML
    return new NextResponse(emailHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  } catch (error) {
    console.error('Error rendering email template:', error)
    return NextResponse.json(
      {
        error: 'Failed to render email template',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
