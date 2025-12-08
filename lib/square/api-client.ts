/**
 * Direct Square API HTTP client
 *
 * Bypasses the Square SDK to use direct HTTP requests with fetch.
 * This avoids OAuth scope issues with the SDK while maintaining full functionality.
 */

const SQUARE_API_VERSION = '2025-10-16'

interface SquareAPIConfig {
  accessToken: string
  environment: 'production' | 'sandbox'
}

class SquareAPIClient {
  private accessToken: string
  private baseUrl: string

  constructor(config: SquareAPIConfig) {
    this.accessToken = config.accessToken.trim()
    this.baseUrl =
      config.environment === 'production'
        ? 'https://connect.squareup.com'
        : 'https://connect.squareupsandbox.com'
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      method,
      headers: {
        'Square-Version': SQUARE_API_VERSION,
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        `Square API Error: ${response.status} - ${JSON.stringify(data.errors || data)}`
      )
    }

    return data as T
  }

  // Orders API
  async createOrder(request: {
    idempotency_key: string
    order: {
      location_id: string
      line_items?: Array<{
        name: string
        quantity: string
        base_price_money?: { amount: number; currency: string }
        catalog_object_id?: string
        variation_name?: string
      }>
      discounts?: Array<{
        name?: string
        amount_money?: { amount: number; currency: string }
        percentage?: string
        scope?: string
      }>
      service_charges?: Array<{
        name: string
        amount_money?: { amount: number; currency: string }
        percentage?: string
        calculation_phase: string
      }>
      fulfillments?: Array<{
        type: string
        state: string
        pickup_details?: {
          recipient: {
            display_name: string
            email_address?: string
            phone_number?: string
          }
          schedule_type: string
          pickup_at?: string
        }
        delivery_details?: {
          recipient: {
            display_name: string
            email_address?: string
            phone_number?: string
            address: {
              address_line_1?: string
              address_line_2?: string
              locality?: string
              administrative_district_level_1?: string
              postal_code?: string
              country: string
            }
          }
          schedule_type: string
          deliver_at?: string
        }
      }>
    }
  }) {
    return this.request<{ order: Record<string, unknown> }>('/v2/orders', 'POST', request)
  }

  // Payment Links API
  async createPaymentLink(request: {
    quick_pay?: {
      name: string
      price_money: { amount: number; currency: string }
      location_id: string
    }
    checkout_options?: {
      allow_tipping?: boolean
      redirect_url?: string
      merchant_support_email?: string
    }
    pre_populated_data?: {
      buyer_email?: string
      buyer_phone_number?: string
      buyer_address?: {
        address_line_1?: string
        address_line_2?: string
        locality?: string
        administrative_district_level_1?: string
        postal_code?: string
        country?: string
      }
    }
  }) {
    return this.request<{ payment_link: Record<string, unknown> }>(
      '/v2/online-checkout/payment-links',
      'POST',
      request
    )
  }

  // Customers API
  async searchCustomers(request: {
    query?: {
      filter?: {
        email_address?: {
          exact?: string
        }
      }
    }
    limit?: number
  }) {
    return this.request<{ customers?: Record<string, unknown>[] }>(
      '/v2/customers/search',
      'POST',
      request
    )
  }

  async createCustomer(request: {
    given_name?: string
    family_name?: string
    email_address?: string
    phone_number?: string
    company_name?: string
    reference_id?: string
  }) {
    return this.request<{ customer: Record<string, unknown> }>('/v2/customers', 'POST', request)
  }

  async updateCustomer(
    customerId: string,
    request: {
      given_name?: string
      family_name?: string
      phone_number?: string
    }
  ) {
    return this.request<{ customer: Record<string, unknown> }>(
      `/v2/customers/${customerId}`,
      'PUT',
      request
    )
  }

  async listCustomers(cursor?: string, limit?: number) {
    const params = new URLSearchParams()
    if (cursor) params.append('cursor', cursor)
    if (limit) params.append('limit', limit.toString())

    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request<{ customers?: Record<string, unknown>[]; cursor?: string }>(
      `/v2/customers${query}`
    )
  }
}

/**
 * Get Square API client for direct HTTP calls
 */
export function getSquareAPIClient(useSandbox: boolean = false): {
  client: SquareAPIClient
  locationId: string
  applicationId: string
  environment: 'sandbox' | 'production'
} {
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

  if (!accessToken || !locationId || !applicationId) {
    throw new Error('Missing required Square environment variables')
  }

  const client = new SquareAPIClient({
    accessToken,
    environment: isProduction ? 'production' : 'sandbox',
  })

  return {
    client,
    locationId,
    applicationId,
    environment: isProduction ? 'production' : 'sandbox',
  }
}
