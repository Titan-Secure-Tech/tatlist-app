export const DELIVERY_CONFIG = {
  // Flat delivery fee for all zones
  flatFee: 5.0,

  // Maximum delivery radius in miles
  maxRadius: 10,

  // Delivery time estimates (in minutes)
  estimatedTime: {
    min: 30,
    max: 90,
  },

  // Supported ZIP codes for local delivery
  // Add your local ZIP codes here
  supportedZipCodes: [
    '90001',
    '90002',
    '90003',
    '90004',
    '90005',
    '90006',
    '90007',
    '90008',
    '90009',
    '90010',
    '90011',
    '90012',
    '90013',
    '90014',
    '90015',
    '90016',
    '90017',
    '90018',
    '90019',
    '90020',
    '90021',
    '90022',
    '90023',
    '90024',
    '90025',
    '90026',
    '90027',
    '90028',
    '90029',
    '90030',
    '90031',
    '90032',
    '90033',
    '90034',
    '90035',
    '90036',
    '90037',
    '90038',
    '90039',
    '90040',
    // Add more ZIP codes as needed
  ],

  // Minimum order amount for delivery
  minimumOrderAmount: 25.0,

  // Business hours for delivery (24-hour format)
  businessHours: {
    monday: { open: '09:00', close: '21:00' },
    tuesday: { open: '09:00', close: '21:00' },
    wednesday: { open: '09:00', close: '21:00' },
    thursday: { open: '09:00', close: '21:00' },
    friday: { open: '09:00', close: '22:00' },
    saturday: { open: '10:00', close: '22:00' },
    sunday: { open: '10:00', close: '20:00' },
  },
}

export function isZipCodeSupported(zipCode: string): boolean {
  return DELIVERY_CONFIG.supportedZipCodes.includes(zipCode)
}

export function getDeliveryFee(zipCode: string): number {
  // Could implement zone-based pricing here
  // For now, return flat fee for all supported zones
  if (!isZipCodeSupported(zipCode)) {
    return 0 // No delivery available
  }
  return DELIVERY_CONFIG.flatFee
}

export function getEstimatedDeliveryTime(): string {
  const { min, max } = DELIVERY_CONFIG.estimatedTime
  if (min === max) {
    return `${min} minutes`
  }
  return `${min}-${max} minutes`
}

export function isDeliveryAvailable(): boolean {
  const now = new Date()
  const dayOfWeek = now.toLocaleDateString('en-US', {
    weekday: 'long',
  }) as keyof typeof DELIVERY_CONFIG.businessHours
  const hours = DELIVERY_CONFIG.businessHours[dayOfWeek]

  if (!hours) return false

  const currentTime = now.toTimeString().slice(0, 5) // HH:MM format
  return currentTime >= hours.open && currentTime <= hours.close
}
