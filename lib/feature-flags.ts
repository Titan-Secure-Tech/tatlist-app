/**
 * Feature flags for the application
 * These can be toggled to enable/disable features
 */

export interface FeatureFlags {
  officeOpen: boolean
}

/**
 * Get the current feature flags
 * In production, these could be loaded from environment variables or a remote config service
 */
export function getFeatureFlags(): FeatureFlags {
  return {
    // Office status - set to false when out of office
    officeOpen: process.env.NEXT_PUBLIC_OFFICE_OPEN !== 'false',
  }
}

/**
 * Check if the office is currently open
 */
export function isOfficeOpen(): boolean {
  return getFeatureFlags().officeOpen
}
