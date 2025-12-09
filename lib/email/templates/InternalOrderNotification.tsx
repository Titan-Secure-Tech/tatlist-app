import { Column, Hr, Row, Section, Text } from '@react-email/components'
import * as React from 'react'
import { BaseLayout } from './BaseLayout'

interface OrderItem {
  name: string
  quantity: number
  price: number
  variant?: string
}

interface DeliveryAddress {
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
}

interface InternalOrderNotificationProps {
  orderId: string
  orderNumber?: string
  customerName: string
  customerEmail: string
  customerPhone: string
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  tax: number
  total: number
  deliveryAddress: DeliveryAddress
  paymentMethod?: string
  businessName?: string
  licenseName?: string
}

export function InternalOrderNotification({
  orderId,
  orderNumber,
  customerName,
  customerEmail,
  customerPhone,
  items,
  subtotal,
  deliveryFee,
  tax,
  total,
  deliveryAddress,
  paymentMethod,
  businessName,
  licenseName,
}: InternalOrderNotificationProps) {
  const displayOrderNumber = orderNumber || orderId.slice(0, 8).toUpperCase()

  return (
    <BaseLayout preview={`NEW ORDER - #${displayOrderNumber}`}>
      <Section style={alertBox}>
        <Text style={alertTitle}>🔔 New Order Received</Text>
        <Text style={orderNumberLarge}>Order #{displayOrderNumber}</Text>
      </Section>

      {/* Customer Information */}
      <Section style={infoSection}>
        <Text style={sectionTitle}>Customer Information</Text>
        <Row style={infoRow}>
          <Column style={infoLabel}>Name:</Column>
          <Column style={infoValue}>{customerName}</Column>
        </Row>
        <Row style={infoRow}>
          <Column style={infoLabel}>Email:</Column>
          <Column style={infoValue}>{customerEmail}</Column>
        </Row>
        <Row style={infoRow}>
          <Column style={infoLabel}>Phone:</Column>
          <Column style={infoValue}>{customerPhone}</Column>
        </Row>
        {businessName && (
          <Row style={infoRow}>
            <Column style={infoLabel}>Business:</Column>
            <Column style={infoValue}>{businessName}</Column>
          </Row>
        )}
        {licenseName && (
          <Row style={infoRow}>
            <Column style={infoLabel}>License:</Column>
            <Column style={infoValue}>{licenseName}</Column>
          </Row>
        )}
      </Section>

      {/* Delivery Address */}
      <Section style={infoSection}>
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

      {/* Order Items */}
      <Section style={tableSection}>
        <Text style={sectionTitle}>Items to Fulfill</Text>

        {/* Table Header */}
        <Row style={tableHeaderRow}>
          <Column style={tableHeaderLeft}>Item</Column>
          <Column style={tableHeaderCenter}>Qty</Column>
          <Column style={tableHeaderRight}>Price</Column>
        </Row>

        {/* Table Items */}
        {items.map((item, index) => (
          <Row key={index} style={tableRow}>
            <Column style={tableCell}>
              {item.name}
              {item.variant && <Text style={variantText}>{item.variant}</Text>}
            </Column>
            <Column style={tableCellCenter}>
              <strong>{item.quantity}</strong>
            </Column>
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
          <Column style={grandTotalLabel}>Total Paid:</Column>
          <Column style={grandTotalValue}>${total.toFixed(2)}</Column>
        </Row>
      </Section>

      {/* Payment Information */}
      <Section style={infoSection}>
        <Row style={infoRow}>
          <Column style={infoLabel}>Payment Method:</Column>
          <Column style={infoValue}>{paymentMethod || 'Card'}</Column>
        </Row>
        <Row style={infoRow}>
          <Column style={infoLabel}>Order ID:</Column>
          <Column style={infoValue}>{orderId}</Column>
        </Row>
      </Section>

      {/* Action Items */}
      <Section style={actionBox}>
        <Text style={actionTitle}>Next Steps:</Text>
        <Text style={actionItem}>1. Prepare items for delivery</Text>
        <Text style={actionItem}>2. Contact customer if any items are unavailable</Text>
        <Text style={actionItem}>3. Update order status in the admin dashboard</Text>
      </Section>
    </BaseLayout>
  )
}

// Styles
const alertBox = {
  backgroundColor: '#000000',
  color: '#ffffff',
  padding: '24px',
  borderRadius: '8px',
  textAlign: 'center' as const,
  margin: '0 0 24px',
}

const alertTitle = {
  fontSize: '14px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 8px',
  color: '#ffffff',
}

const orderNumberLarge = {
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
  color: '#ffffff',
}

const sectionTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#000000',
  margin: '0 0 12px',
  borderBottom: '2px solid #000000',
  paddingBottom: '8px',
}

const infoSection = {
  margin: '24px 0',
  padding: '16px',
  backgroundColor: '#f9f9f9',
  borderRadius: '8px',
}

const infoRow = {
  marginBottom: '8px',
}

const infoLabel = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#666666',
  width: '120px',
}

const infoValue = {
  fontSize: '14px',
  color: '#000000',
}

const addressText = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#000000',
  margin: '0',
}

const tableSection = {
  margin: '24px 0',
}

const tableHeaderRow = {
  backgroundColor: '#000000',
  padding: '12px 0',
}

const tableHeaderLeft = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#ffffff',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  padding: '0 8px',
}

const tableHeaderCenter = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#ffffff',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  textAlign: 'center' as const,
  padding: '0 8px',
}

const tableHeaderRight = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#ffffff',
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
  color: '#000000',
  padding: '8px',
}

const tableCellCenter = {
  fontSize: '15px',
  color: '#000000',
  textAlign: 'center' as const,
  padding: '8px',
}

const tableCellRight = {
  fontSize: '15px',
  color: '#000000',
  textAlign: 'right' as const,
  padding: '8px',
}

const variantText = {
  fontSize: '13px',
  color: '#666666',
  display: 'block',
  marginTop: '4px',
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
  backgroundColor: '#f9f9f9',
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

const actionBox = {
  margin: '24px 0',
  padding: '20px',
  backgroundColor: '#fffbeb',
  borderRadius: '8px',
  borderLeft: '4px solid #000000',
}

const actionTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#000000',
  margin: '0 0 12px',
}

const actionItem = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#333333',
  margin: '0 0 8px',
}
