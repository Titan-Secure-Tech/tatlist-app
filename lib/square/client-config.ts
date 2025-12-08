import { SquareClient, SquareEnvironment } from 'square'

interface SquareConfig {
  client: SquareClient
  locationId: string
  applicationId: string
  environment: 'sandbox' | 'production'
}

/**
 * Get Square configuration based on user's sandbox status
 * @param useSandbox - Whether to use sandbox mode (from user profile)
 * @returns Square client and configuration
 * @throws Error if required environment variables are not set
 */
export function getSquareConfig(useSandbox: boolean = false): SquareConfig {
  const isProduction = process.env.NODE_ENV === 'production' && !useSandbox

  const accessToken = isProduction
    ? process.env.SQUARE_PRODUCTION_ACCESS_TOKEN
    : process.env.SQUARE_SANDBOX_ACCESS_TOKEN

  const locationId = isProduction
    ? process.env.SQUARE_PRODUCTION_LOCATION_ID
    : process.env.SQUARE_SANDBOX_LOCATION_ID

  const applicationId = isProduction
    ? process.env.SQUARE_PRODUCTION_APPLICATION_ID
    : process.env.SQUARE_SANDBOX_APPLICATION_ID

  // Validate required environment variables
  if (!accessToken) {
    throw new Error(
      `Missing ${isProduction ? 'SQUARE_PRODUCTION_ACCESS_TOKEN' : 'SQUARE_SANDBOX_ACCESS_TOKEN'} environment variable`
    )
  }

  if (!locationId) {
    throw new Error(
      `Missing ${isProduction ? 'SQUARE_PRODUCTION_LOCATION_ID' : 'SQUARE_SANDBOX_LOCATION_ID'} environment variable`
    )
  }

  if (!applicationId) {
    throw new Error(
      `Missing ${isProduction ? 'SQUARE_PRODUCTION_APPLICATION_ID' : 'SQUARE_SANDBOX_APPLICATION_ID'} environment variable`
    )
  }

  // Clean the access token - trim any whitespace that might have snuck in
  const cleanToken = accessToken.trim()

  // Debug logging (production only)
  if (isProduction) {
    console.log('[Square Config] Token length:', cleanToken.length)
    console.log('[Square Config] Token starts with:', cleanToken.substring(0, 20))
    console.log('[Square Config] Token ends with:', cleanToken.substring(cleanToken.length - 10))
    console.log('[Square Config] Has whitespace:', /\s/.test(cleanToken) ? 'YES ❌' : 'NO ✅')
  }

  const client = new SquareClient({
    accessToken: cleanToken,
    environment: isProduction ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
    squareVersion: '2025-10-16', // Use latest API version
  })

  return {
    client,
    locationId,
    applicationId,
    environment: isProduction ? 'production' : 'sandbox',
  }
}

/**
 * Check if an email is in the sandbox test list
 * @param email - User email to check
 * @returns Whether user should see sandbox mode
 */
export function isSandboxUser(email: string): boolean {
  const sandboxEmails = ['crushjunkmail@gmail.com', 'james@familiawashington.com']
  return sandboxEmails.includes(email.toLowerCase())
}
