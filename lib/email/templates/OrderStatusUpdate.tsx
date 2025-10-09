import { Section, Text } from '@react-email/components'
import * as React from 'react'
import { BaseLayout } from './BaseLayout'

type OrderStatus = 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled'

interface OrderStatusUpdateProps {
  orderId: string
  customerName: string
  status: OrderStatus
  message?: string
  estimatedTime?: string
}

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  preparing: {
    label: 'Being Prepared',
    color: '#FFA500',
  },
  ready: {
    label: 'Ready for Delivery',
    color: '#4CAF50',
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    color: '#2196F3',
  },
  delivered: {
    label: 'Delivered',
    color: '#4CAF50',
  },
  cancelled: {
    label: 'Cancelled',
    color: '#F44336',
  },
}

export function OrderStatusUpdate({
  orderId,
  customerName,
  status,
  message,
  estimatedTime,
}: OrderStatusUpdateProps) {
  const orderNumber = orderId.slice(0, 8).toUpperCase()
  const config = statusConfig[status]

  const getStatusMessage = () => {
    switch (status) {
      case 'preparing':
        return 'Your order is being carefully prepared by our team.'
      case 'ready':
        return 'Your order is ready and will be shipped soon!'
      case 'out_for_delivery':
        return 'Your order is on its way to you!'
      case 'delivered':
        return 'Your order has been successfully delivered.'
      case 'cancelled':
        return 'Your order has been cancelled.'
      default:
        return 'Your order status has been updated.'
    }
  }

  return (
    <BaseLayout preview={`Order Update: ${config.label} - #${orderNumber}`}>
      <Text style={greeting}>Hi {customerName},</Text>

      {/* Status Badge */}
      <Section style={statusBox(config.color)}>
        <Text style={orderTitle}>Order #{orderNumber}</Text>
        <Section style={statusBadge(config.color)}>
          <Text style={statusBadgeText}>{config.label}</Text>
        </Section>
        <Text style={statusMessage}>{getStatusMessage()}</Text>

        {message && <Text style={customMessage}>{message}</Text>}

        {estimatedTime && (
          <Text style={estimatedTimeText}>
            <strong>Estimated time:</strong> {estimatedTime}
          </Text>
        )}
      </Section>

      {/* Status-specific information */}
      {status === 'out_for_delivery' && (
        <Section style={infoBox('#e3f2fd', '#2196F3')}>
          <Text style={infoTitle}>Your delivery is on the way</Text>
          <Text style={infoText}>Please ensure someone is available to receive the order.</Text>
        </Section>
      )}

      {status === 'delivered' && (
        <Section style={infoBox('#e8f5e9', '#4CAF50')}>
          <Text style={infoTitle}>Thank you for your order</Text>
          <Text style={infoText}>
            We hope you enjoy your products. Feel free to order again anytime.
          </Text>
        </Section>
      )}

      {status === 'cancelled' && (
        <Section style={infoBox('#ffebee', '#F44336')}>
          <Text style={infoTitle}>We&apos;re sorry your order was cancelled</Text>
          <Text style={infoText}>
            If you have any questions, please contact our support team. We&apos;re here to help.
          </Text>
        </Section>
      )}

      {status === 'ready' && (
        <Section style={infoBox('#fff9e6', '#FFA500')}>
          <Text style={infoTitle}>Ready for pickup or delivery</Text>
          <Text style={infoText}>
            Your order is packed and ready to go. You&apos;ll receive another update when it&apos;s
            out for delivery.
          </Text>
        </Section>
      )}
    </BaseLayout>
  )
}

// Styles
const greeting = {
  fontSize: '18px',
  lineHeight: '28px',
  color: '#333333',
  margin: '0 0 24px',
  fontWeight: '500',
}

const statusBox = (borderColor: string) => ({
  padding: '32px 24px',
  backgroundColor: '#f9f9f9',
  borderRadius: '8px',
  borderLeft: `5px solid ${borderColor}`,
  margin: '24px 0',
  textAlign: 'center' as const,
})

const orderTitle = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#000000',
  margin: '0 0 16px',
}

const statusBadge = (backgroundColor: string) => ({
  display: 'inline-block',
  backgroundColor,
  padding: '12px 24px',
  borderRadius: '25px',
  margin: '12px 0',
})

const statusBadgeText = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '0',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
}

const statusMessage = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#333333',
  margin: '16px 0 0',
  fontWeight: '500',
}

const customMessage = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#666666',
  margin: '12px 0 0',
}

const estimatedTimeText = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#333333',
  margin: '16px 0 0',
}

const infoBox = (bgColor: string, borderColor: string) => ({
  padding: '20px',
  backgroundColor: bgColor,
  borderRadius: '8px',
  borderLeft: `4px solid ${borderColor}`,
  margin: '24px 0',
})

const infoTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#000000',
  margin: '0 0 8px',
}

const infoText = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#333333',
  margin: '0',
}
