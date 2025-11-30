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

  const client = new SquareClient({
    accessToken,
    environment: isProduction ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
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
