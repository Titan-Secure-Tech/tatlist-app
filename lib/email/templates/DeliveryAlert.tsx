/**
 * Delivery Alert Email Template
 *
 * Sent when driver is approaching customer location
 * Issue #55: Implement Geolocation Alerts
 */

import { Section, Text, Button } from '@react-email/components'
import * as React from 'react'
import { BaseLayout } from './BaseLayout'

type AlertType =
  | 'eta_10_minutes'
  | 'eta_5_minutes'
  | 'arriving_now'
  | 'distance_2_miles'
  | 'distance_1_mile'
  | 'distance_half_mile'

interface DeliveryAlertProps {
  orderId: string
  customerName: string
  alertType: AlertType
  distanceMiles?: number
  etaMinutes?: number
  driverName?: string
  driverPhone?: string
  trackingUrl?: string
}

const alertConfig: Record<
  AlertType,
  { label: string; icon: string; color: string; urgency: 'high' | 'medium' | 'low' }
> = {
  arriving_now: {
    label: 'Driver Arriving Now',
    icon: '📍',
    color: '#4CAF50',
    urgency: 'high',
  },
  eta_5_minutes: {
    label: '5 Minutes Away',
    icon: '⏱️',
    color: '#FF9800',
    urgency: 'high',
  },
  eta_10_minutes: {
    label: '10 Minutes Away',
    icon: '🚗',
    color: '#2196F3',
    urgency: 'medium',
  },
  distance_half_mile: {
    label: '0.5 Miles Away',
    icon: '📍',
    color: '#4CAF50',
    urgency: 'high',
  },
  distance_1_mile: {
    label: '1 Mile Away',
    icon: '🚗',
    color: '#FF9800',
    urgency: 'high',
  },
  distance_2_miles: {
    label: '2 Miles Away',
    icon: '🚗',
    color: '#2196F3',
    urgency: 'medium',
  },
}

export function DeliveryAlert({
  orderId,
  customerName,
  alertType,
  distanceMiles,
  etaMinutes,
  driverName,
  driverPhone,
  trackingUrl,
}: DeliveryAlertProps) {
  const orderNumber = orderId.slice(0, 8).toUpperCase()
  const config = alertConfig[alertType]

  const getAlertMessage = () => {
    if (alertType === 'arriving_now') {
      return 'Your driver is arriving at your location now! Please be ready to receive your order.'
    }

    if (alertType.startsWith('eta_')) {
      return `Your driver will arrive in approximately ${etaMinutes} minutes. Please ensure someone is available to receive the delivery.`
    }

    if (alertType.startsWith('distance_')) {
      return `Your driver is approximately ${distanceMiles?.toFixed(1)} miles away from your location. Your order will arrive soon!`
    }

    return 'Your driver is approaching your delivery location.'
  }

  const getPreparationTips = () => {
    const isUrgent = config.urgency === 'high'

    if (isUrgent) {
      return [
        'Ensure someone is available to receive the delivery',
        'Have your order number ready for verification',
        'Clear a space for the delivery if needed',
      ]
    }

    return [
      'Your order will arrive soon',
      'You can track your driver in real-time',
      'Contact the driver if you have any questions',
    ]
  }

  return (
    <BaseLayout preview={`${config.label} - Order #${orderNumber}`}>
      <Text style={greeting}>Hi {customerName},</Text>

      {/* Alert Badge */}
      <Section style={alertBox(config.color, config.urgency)}>
        <Text style={iconStyle}>{config.icon}</Text>
        <Text style={alertTitle}>{config.label}</Text>
        <Text style={orderSubtitle}>Order #{orderNumber}</Text>
      </Section>

      {/* Main Message */}
      <Section style={messageBox}>
        <Text style={mainMessage}>{getAlertMessage()}</Text>

        {etaMinutes && etaMinutes > 0 && (
          <Section style={etaBox}>
            <Text style={etaLabel}>Estimated Arrival</Text>
            <Text style={etaValue}>{etaMinutes} minutes</Text>
          </Section>
        )}

        {distanceMiles && distanceMiles > 0 && (
          <Section style={distanceBox}>
            <Text style={distanceLabel}>Distance</Text>
            <Text style={distanceValue}>{distanceMiles.toFixed(1)} miles</Text>
          </Section>
        )}
      </Section>

      {/* Driver Information */}
      {(driverName || driverPhone) && (
        <Section style={driverBox}>
          <Text style={driverTitle}>Your Driver</Text>
          {driverName && <Text style={driverInfo}>👤 {driverName}</Text>}
          {driverPhone && (
            <Text style={driverInfo}>
              📞 <a href={`tel:${driverPhone}`} style={phoneLink}>{driverPhone}</a>
            </Text>
          )}
        </Section>
      )}

      {/* Preparation Tips */}
      <Section style={tipsBox}>
        <Text style={tipsTitle}>
          {config.urgency === 'high' ? '⚡ Please Be Ready' : '💡 Helpful Tips'}
        </Text>
        {getPreparationTips().map((tip, index) => (
          <Text key={index} style={tipItem}>
            • {tip}
          </Text>
        ))}
      </Section>

      {/* Track Button */}
      {trackingUrl && (
        <Section style={buttonContainer}>
          <Button href={trackingUrl} style={trackButton(config.color)}>
            Track Your Delivery
          </Button>
        </Section>
      )}

      {/* Footer Note */}
      <Text style={footerNote}>
        This is an automated notification based on your driver&apos;s real-time location. Actual
        arrival time may vary due to traffic conditions.
      </Text>
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

const alertBox = (borderColor: string, urgency: 'high' | 'medium' | 'low') => ({
  padding: '32px 24px',
  backgroundColor: urgency === 'high' ? '#fff8f0' : '#f9f9f9',
  borderRadius: '12px',
  borderLeft: `6px solid ${borderColor}`,
  margin: '24px 0',
  textAlign: 'center' as const,
})

const iconStyle = {
  fontSize: '48px',
  margin: '0 0 16px',
}

const alertTitle = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#000000',
  margin: '0 0 8px',
}

const orderSubtitle = {
  fontSize: '16px',
  color: '#666666',
  margin: '0',
  fontWeight: '500',
}

const messageBox = {
  padding: '24px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  border: '1px solid #e0e0e0',
  margin: '24px 0',
}

const mainMessage = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#333333',
  margin: '0 0 16px',
  fontWeight: '500',
}

const etaBox = {
  display: 'inline-block',
  padding: '16px 24px',
  backgroundColor: '#f5f5f5',
  borderRadius: '8px',
  margin: '16px 8px 0 0',
  textAlign: 'center' as const,
}

const etaLabel = {
  fontSize: '13px',
  color: '#666666',
  margin: '0 0 4px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const etaValue = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#000000',
  margin: '0',
}

const distanceBox = {
  display: 'inline-block',
  padding: '16px 24px',
  backgroundColor: '#f5f5f5',
  borderRadius: '8px',
  margin: '16px 0 0',
  textAlign: 'center' as const,
}

const distanceLabel = {
  fontSize: '13px',
  color: '#666666',
  margin: '0 0 4px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const distanceValue = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#000000',
  margin: '0',
}

const driverBox = {
  padding: '20px',
  backgroundColor: '#f0f7ff',
  borderRadius: '8px',
  borderLeft: '4px solid #2196F3',
  margin: '24px 0',
}

const driverTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#000000',
  margin: '0 0 12px',
}

const driverInfo = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#333333',
  margin: '4px 0',
}

const phoneLink = {
  color: '#2196F3',
  textDecoration: 'none',
  fontWeight: '500',
}

const tipsBox = {
  padding: '20px',
  backgroundColor: '#f9f9f9',
  borderRadius: '8px',
  margin: '24px 0',
}

const tipsTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#000000',
  margin: '0 0 12px',
}

const tipItem = {
  fontSize: '15px',
  lineHeight: '26px',
  color: '#333333',
  margin: '4px 0 4px 8px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const trackButton = (backgroundColor: string) => ({
  backgroundColor,
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '14px 32px',
  borderRadius: '8px',
  display: 'inline-block',
  textAlign: 'center' as const,
})

const footerNote = {
  fontSize: '13px',
  lineHeight: '20px',
  color: '#999999',
  margin: '24px 0 0',
  textAlign: 'center' as const,
}
