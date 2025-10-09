import { Column, Hr, Row, Section, Text } from '@react-email/components'
import * as React from 'react'
import { BaseLayout } from './BaseLayout'

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface DeliveryAddress {
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
}

interface OrderConfirmationProps {
  orderId: string
  customerName: string
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  tax: number
  total: number
  deliveryAddress: DeliveryAddress
}

export function OrderConfirmation({
  orderId,
  customerName,
  items,
  subtotal,
  deliveryFee,
  tax,
  total,
  deliveryAddress,
}: OrderConfirmationProps) {
  const orderNumber = orderId.slice(0, 8).toUpperCase()

  return (
    <BaseLayout preview={`Order Confirmation - #${orderNumber}`}>
      <Text style={greeting}>Hi {customerName},</Text>
      <Text style={paragraph}>
        Thank you for your order! We&apos;ve received your order and it&apos;s being prepared for
        delivery.
      </Text>

      {/* Order Number */}
      <Section style={orderBox}>
        <Text style={orderTitle}>Order #{orderNumber}</Text>
      </Section>

      {/* Items Table */}
      <Section style={tableSection}>
        <Text style={sectionTitle}>Items Ordered</Text>

        {/* Table Header */}
        <Row style={tableHeaderRow}>
          <Column style={tableHeaderLeft}>Item</Column>
          <Column style={tableHeaderCenter}>Qty</Column>
          <Column style={tableHeaderRight}>Price</Column>
        </Row>

        {/* Table Items */}
        {items.map((item, index) => (
          <Row key={index} style={tableRow}>
            <Column style={tableCell}>{item.name}</Column>
            <Column style={tableCellCenter}>{item.quantity}</Column>
            <Column style={tableCellRight}>${item.price.toFixed(2)}</Column>
          </Row>
        ))}

        {/* Totals */}
        <Hr style={divider} />

        <Row style={totalRow}>
          <Column style={totalLabel}>Subtotal:</Column>
          <Column style={totalValue}>${subtotal.toFixed(2)}</Column>
        </Row>

        <Row style={totalRow}>
          <Column style={totalLabel}>Delivery Fee:</Column>
          <Column style={totalValue}>${deliveryFee.toFixed(2)}</Column>
        </Row>

        <Row style={totalRow}>
          <Column style={totalLabel}>Tax:</Column>
          <Column style={totalValue}>${tax.toFixed(2)}</Column>
        </Row>

        <Row style={grandTotalRow}>
          <Column style={grandTotalLabel}>Total:</Column>
          <Column style={grandTotalValue}>${total.toFixed(2)}</Column>
        </Row>
      </Section>

      {/* Delivery Address */}
      <Section style={addressSection}>
        <Text style={sectionTitle}>Delivery Address</Text>
        <Text style={addressText}>
          {deliveryAddress.line1}
          {deliveryAddress.line2 && (
            <>
              <br />
              {deliveryAddress.line2}
            </>
          )}
          <br />
          {deliveryAddress.city}, {deliveryAddress.state} {deliveryAddress.postalCode}
        </Text>
      </Section>

      {/* What's Next */}
      <Section style={nextStepsBox}>
        <Text style={nextStepsTitle}>What&apos;s Next?</Text>
        <Text style={nextStepsItem}>• Your order is being prepared</Text>
        <Text style={nextStepsItem}>
          • You&apos;ll receive an update when it&apos;s out for delivery
        </Text>
        <Text style={nextStepsItem}>• Estimated delivery time: Within 3 hours</Text>
      </Section>
    </BaseLayout>
  )
}

// Styles
const greeting = {
  fontSize: '18px',
  lineHeight: '28px',
  color: '#333333',
  margin: '0 0 16px',
  fontWeight: '500',
}

const paragraph = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#666666',
  margin: '0 0 24px',
}

const orderBox = {
  backgroundColor: '#f9f9f9',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #e5e5e5',
  margin: '24px 0',
}

const orderTitle = {
  fontSize: '22px',
  fontWeight: 'bold',
  color: '#000000',
  margin: '0',
  textAlign: 'center' as const,
}

const sectionTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#000000',
  margin: '0 0 16px',
}

const tableSection = {
  margin: '24px 0',
}

const tableHeaderRow = {
  backgroundColor: '#f9f9f9',
  padding: '12px 0',
}

const tableHeaderLeft = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#666666',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  padding: '0 8px',
}

const tableHeaderCenter = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#666666',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  textAlign: 'center' as const,
  padding: '0 8px',
}

const tableHeaderRight = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#666666',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  textAlign: 'right' as const,
  padding: '0 8px',
}

const tableRow = {
  borderBottom: '1px solid #e5e5e5',
  padding: '12px 0',
}

const tableCell = {
  fontSize: '15px',
  color: '#333333',
  padding: '8px',
}

const tableCellCenter = {
  fontSize: '15px',
  color: '#333333',
  textAlign: 'center' as const,
  padding: '8px',
}

const tableCellRight = {
  fontSize: '15px',
  color: '#333333',
  textAlign: 'right' as const,
  padding: '8px',
}

const divider = {
  margin: '20px 0',
  borderColor: '#e5e5e5',
}

const totalRow = {
  padding: '8px 0',
}

const totalLabel = {
  fontSize: '15px',
  color: '#666666',
  padding: '0 8px',
}

const totalValue = {
  fontSize: '15px',
  color: '#333333',
  textAlign: 'right' as const,
  padding: '0 8px',
}

const grandTotalRow = {
  padding: '12px 0',
  borderTop: '2px solid #000000',
  marginTop: '8px',
}

const grandTotalLabel = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#000000',
  padding: '0 8px',
}

const grandTotalValue = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#000000',
  textAlign: 'right' as const,
  padding: '0 8px',
}

const addressSection = {
  margin: '24px 0',
  padding: '20px',
  backgroundColor: '#f9f9f9',
  borderRadius: '8px',
}

const addressText = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#333333',
  margin: '0',
}

const nextStepsBox = {
  margin: '24px 0',
  padding: '20px',
  backgroundColor: '#f0f8ff',
  borderRadius: '8px',
  borderLeft: '4px solid #000000',
}

const nextStepsTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#000000',
  margin: '0 0 12px',
}

const nextStepsItem = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#333333',
  margin: '0 0 8px',
}
