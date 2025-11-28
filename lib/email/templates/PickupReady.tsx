import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface PickupReadyEmailProps {
  orderId: string
  customerName: string
  items: Array<{ name: string; quantity: number }>
  pickupLocation: {
    name: string
    address: string
    city: string
    state: string
    zipCode: string
    hours?: string
  }
}

export function PickupReady({
  orderId = 'ORD-12345678',
  customerName = 'John Doe',
  items = [{ name: 'Sample Product', quantity: 1 }],
  pickupLocation = {
    name: 'Black Eye Tattoo',
    address: '1234 Main Street',
    city: 'Tampa',
    state: 'FL',
    zipCode: '33601',
    hours: '10:00 AM - 8:00 PM',
  },
}: PickupReadyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Your Tatlist order #{orderId.slice(0, 8).toUpperCase()} is ready for pickup!
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>Order Ready for Pickup</Heading>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={greeting}>Hi {customerName},</Text>
            <Text style={text}>
              Great news! Your order is ready for pickup at {pickupLocation.name}.
            </Text>

            {/* Order Number */}
            <Section style={orderNumberSection}>
              <Text style={orderNumberLabel}>Order Number</Text>
              <Text style={orderNumber}>#{orderId.slice(0, 8).toUpperCase()}</Text>
            </Section>

            {/* Items */}
            <Section style={itemsSection}>
              <Heading as="h2" style={h2}>
                Order Items
              </Heading>
              {items.map((item, index) => (
                <div key={index} style={itemRow}>
                  <Text style={itemText}>
                    {item.name} (x{item.quantity})
                  </Text>
                </div>
              ))}
            </Section>

            <Hr style={divider} />

            {/* Pickup Location */}
            <Section style={pickupSection}>
              <Heading as="h2" style={h2}>
                Pickup Location
              </Heading>
              <Text style={locationName}>{pickupLocation.name}</Text>
              <Text style={address}>{pickupLocation.address}</Text>
              <Text style={address}>
                {pickupLocation.city}, {pickupLocation.state} {pickupLocation.zipCode}
              </Text>
              {pickupLocation.hours && <Text style={hours}>Hours: {pickupLocation.hours}</Text>}
            </Section>

            <Hr style={divider} />

            {/* Instructions */}
            <Section style={instructionsSection}>
              <Heading as="h2" style={h2}>
                Pickup Instructions
              </Heading>
              <Text style={text}>
                • Bring your order number: <strong>#{orderId.slice(0, 8).toUpperCase()}</strong>
              </Text>
              <Text style={text}>• Show this email or provide your order number at pickup</Text>
              <Text style={text}>• Please bring a valid ID for verification</Text>
              <Text style={text}>• Your order will be held for 7 days</Text>
            </Section>

            <Hr style={divider} />

            {/* Footer */}
            <Text style={footer}>
              Questions? Reply to this email or contact us at support@tatlist.com
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default PickupReady

// Styles
const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '600px',
  maxWidth: '100%',
}

const header = {
  backgroundColor: '#000000',
  padding: '32px 24px',
  textAlign: 'center' as const,
}

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
}

const content = {
  padding: '24px',
}

const greeting = {
  fontSize: '16px',
  margin: '0 0 16px',
}

const text = {
  fontSize: '14px',
  lineHeight: '24px',
  margin: '8px 0',
  color: '#374151',
}

const orderNumberSection = {
  backgroundColor: '#f3f4f6',
  padding: '16px',
  borderRadius: '8px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const orderNumberLabel = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
}

const orderNumber = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#000000',
  margin: '0',
  letterSpacing: '2px',
}

const itemsSection = {
  margin: '24px 0',
}

const h2 = {
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  color: '#000000',
}

const itemRow = {
  padding: '12px 0',
  borderBottom: '1px solid #e5e7eb',
}

const itemText = {
  fontSize: '14px',
  margin: '0',
  color: '#374151',
}

const divider = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
}

const pickupSection = {
  margin: '24px 0',
}

const locationName = {
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px',
  color: '#000000',
}

const address = {
  fontSize: '14px',
  margin: '4px 0',
  color: '#374151',
}

const hours = {
  fontSize: '14px',
  margin: '12px 0 0',
  color: '#374151',
  fontWeight: '500' as const,
}

const instructionsSection = {
  margin: '24px 0',
}

const footer = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '24px 0 0',
  textAlign: 'center' as const,
}
