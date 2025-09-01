// Mailgun Webhook Event Types
export interface MailgunDeliveryStatus {
  code?: number
  message?: string
  description?: string
}

export interface MailgunMessageHeaders {
  'message-id'?: string
  subject?: string
  from?: string
  to?: string
}

export interface MailgunMessage {
  headers?: MailgunMessageHeaders
  attachments?: MailgunAttachment[]
  size?: number
}

export interface MailgunAttachment {
  filename?: string
  contentType?: string
  size?: number
  url?: string
}

export interface MailgunSending {
  domain?: string
}

export interface MailgunRecipient {
  email?: string
  name?: string
}

export interface MailgunEvent {
  event?: 'delivered' | 'opened' | 'clicked' | 'unsubscribed' | 'complained' | 'failed' | 'bounced'
  'event-type'?: string
  recipient?: string
  domain?: string
  'message-id'?: string
  timestamp?: number | string
  reason?: string
  severity?: 'temporary' | 'permanent'
  code?: number
  error?: string
  notification?: string
  'delivery-status'?: MailgunDeliveryStatus
  message?: MailgunMessage
  sending?: MailgunSending
  'recipient-domain'?: string
  'client-info'?: {
    'client-type'?: string
    'client-name'?: string
    'client-os'?: string
    'device-type'?: string
    'user-agent'?: string
  }
  geolocation?: {
    country?: string
    region?: string
    city?: string
  }
  tags?: string[]
  'user-variables'?: Record<string, string>
}

export interface MailgunWebhookPayload {
  signature?: {
    timestamp?: string
    token?: string
    signature?: string
  }
  'event-data'?: MailgunEvent
  // Legacy format fields
  event?: string
  recipient?: string
  domain?: string
  'Message-Id'?: string
  timestamp?: string
  token?: string
  reason?: string
  code?: string
  error?: string
  notification?: string
}

export interface MailgunEmailEventRecord {
  event_type: string
  recipient: string | null
  message_id?: string | null
  domain?: string | null
  timestamp: string
  event_data: MailgunEvent
  severity?: string | null
  reason?: string | null
  delivery_status_code?: number | null
  delivery_status_message?: string | null
}

// Mailgun API Response Types
export interface MailgunSendResponse {
  id: string
  message: string
}

export interface MailgunSendRequest {
  from: string
  to: string | string[]
  subject: string
  html?: string
  text?: string
  cc?: string | string[]
  bcc?: string | string[]
  'h:Reply-To'?: string
  'o:tag'?: string | string[]
  'o:campaign'?: string
  'o:dkim'?: 'yes' | 'no'
  'o:deliverytime'?: string
  'o:testmode'?: 'yes' | 'no'
  'o:tracking'?: 'yes' | 'no'
  'o:tracking-clicks'?: 'yes' | 'no' | 'htmlonly'
  'o:tracking-opens'?: 'yes' | 'no'
  'v:custom-var'?: string
}
