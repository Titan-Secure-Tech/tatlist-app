import { Body, Container, Head, Html, Preview, Section, Text } from '@react-email/components'
import * as React from 'react'

interface BaseLayoutProps {
  preview: string
  children: React.ReactNode
}

export function BaseLayout({ preview, children }: BaseLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerText}>TATLIST</Text>
          </Section>

          {/* Content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerTitle}>Questions?</Text>
            <Text style={footerContact}>support@tatlist.com | 813-310-3877</Text>
            <Text style={footerCopyright}>© 2025 Tatlist. All rights reserved.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f6f6',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
}

const header = {
  backgroundColor: '#000000',
  padding: '32px 20px',
  textAlign: 'center' as const,
}

const headerText = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
  letterSpacing: '2px',
}

const content = {
  padding: '32px 20px',
  backgroundColor: '#ffffff',
}

const footer = {
  backgroundColor: '#f9f9f9',
  padding: '32px 20px',
  textAlign: 'center' as const,
  borderTop: '1px solid #e5e5e5',
}

const footerTitle = {
  color: '#333333',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 8px',
}

const footerContact = {
  color: '#666666',
  fontSize: '13px',
  margin: '0 0 16px',
}

const footerCopyright = {
  color: '#999999',
  fontSize: '11px',
  margin: '0',
}
