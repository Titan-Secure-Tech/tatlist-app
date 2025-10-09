import { Hr, Link, Section, Text } from '@react-email/components'
import * as React from 'react'
import { BaseLayout } from './BaseLayout'

interface ContactFormProps {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

export function ContactForm({ name, email, phone, subject, message }: ContactFormProps) {
  return (
    <BaseLayout preview={`Contact Form: ${subject}`}>
      {/* Header */}
      <Section style={titleSection}>
        <Text style={title}>New Contact Form Submission</Text>
        <Text style={subtitle}>Someone has reached out via the Tatlist contact form</Text>
      </Section>

      {/* Contact Details */}
      <Section style={messageBox}>
        <Section style={fieldSection}>
          <Text style={fieldLabel}>From:</Text>
          <Text style={fieldValue}>{name}</Text>
        </Section>

        <Hr style={divider} />

        <Section style={fieldSection}>
          <Text style={fieldLabel}>Email:</Text>
          <Text style={fieldValue}>
            <Link href={`mailto:${email}`} style={emailLink}>
              {email}
            </Link>
          </Text>
        </Section>

        {phone && (
          <>
            <Hr style={divider} />
            <Section style={fieldSection}>
              <Text style={fieldLabel}>Phone:</Text>
              <Text style={fieldValue}>{phone}</Text>
            </Section>
          </>
        )}

        <Hr style={divider} />

        <Section style={fieldSection}>
          <Text style={fieldLabel}>Subject:</Text>
          <Text style={fieldValue}>{subject}</Text>
        </Section>

        <Hr style={divider} />

        <Section style={messageSection}>
          <Text style={fieldLabel}>Message:</Text>
          <Section style={messageContent}>
            <Text style={messageText}>{message}</Text>
          </Section>
        </Section>
      </Section>

      {/* Action Required Box */}
      <Section style={actionBox}>
        <Text style={actionTitle}>⚡ Action Required</Text>
        <Text style={actionText}>Please respond to this inquiry within 24 hours.</Text>
        <Text style={actionText}>
          Reply directly to:{' '}
          <Link href={`mailto:${email}`} style={actionLink}>
            {email}
          </Link>
        </Text>
      </Section>

      {/* Footer Note */}
      <Section style={noteSection}>
        <Text style={noteText}>
          This message was sent via the Tatlist contact form at{' '}
          {new Date().toLocaleString('en-US', {
            dateStyle: 'long',
            timeStyle: 'short',
          })}
        </Text>
      </Section>
    </BaseLayout>
  )
}

// Styles
const titleSection = {
  textAlign: 'center' as const,
  margin: '0 0 32px',
}

const title = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#000000',
  margin: '0 0 8px',
}

const subtitle = {
  fontSize: '15px',
  color: '#666666',
  margin: '0',
}

const messageBox = {
  backgroundColor: '#ffffff',
  padding: '24px',
  borderRadius: '8px',
  border: '2px solid #e5e5e5',
  margin: '24px 0',
}

const fieldSection = {
  margin: '16px 0',
}

const fieldLabel = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#666666',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 8px',
}

const fieldValue = {
  fontSize: '16px',
  color: '#000000',
  margin: '0',
  lineHeight: '24px',
}

const emailLink = {
  color: '#2196F3',
  textDecoration: 'underline',
}

const divider = {
  margin: '16px 0',
  borderColor: '#e5e5e5',
}

const messageSection = {
  margin: '16px 0',
}

const messageContent = {
  backgroundColor: '#f5f5f5',
  padding: '16px',
  borderRadius: '6px',
  margin: '8px 0 0',
  border: '1px solid #e5e5e5',
}

const messageText = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#333333',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
}

const actionBox = {
  backgroundColor: '#fff9e6',
  padding: '20px',
  borderRadius: '8px',
  borderLeft: '4px solid #FFA500',
  margin: '24px 0',
}

const actionTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#000000',
  margin: '0 0 12px',
}

const actionText = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#333333',
  margin: '0 0 8px',
}

const actionLink = {
  color: '#2196F3',
  textDecoration: 'underline',
  fontWeight: '500',
}

const noteSection = {
  margin: '24px 0 0',
  textAlign: 'center' as const,
}

const noteText = {
  fontSize: '13px',
  color: '#999999',
  margin: '0',
  fontStyle: 'italic',
}
