import { createClient } from '@/lib/supabase/server'
import { SupabaseClient } from '@supabase/supabase-js'
import { getSquareAPIClient } from '@/lib/square/api-client'

type SquareAPIClient = ReturnType<typeof getSquareAPIClient>['client']

interface SyncResult {
  success: boolean
  customersCreated: number
  customersUpdated: number
  customersMatched: number
  customersFailed: number
  errors: Array<{ email?: string; error: string }>
  syncLogId?: string
}

interface SquareCustomer {
  id: string
  givenName?: string
  familyName?: string
  emailAddress?: string
  phoneNumber?: string
  companyName?: string
  address?: Record<string, unknown>
  referenceId?: string
  createdAt?: string
  updatedAt?: string
}

export class SquareCustomerSyncService {
  private supabase: SupabaseClient | Promise<SupabaseClient>
  private squareClient: SquareAPIClient | null
  private useSandbox: boolean
  private syncLogId?: string

  constructor(
    supabaseClient?: SupabaseClient | Promise<SupabaseClient>,
    useSandbox: boolean = false
  ) {
    this.supabase = supabaseClient || createClient()
    this.squareClient = null
    this.useSandbox = useSandbox
  }

  /**
   * Get Square API client - uses direct HTTP client (not SDK)
   */
  private getSquareClient(): SquareAPIClient {
    if (this.squareClient) {
      return this.squareClient
    }
    const config = getSquareAPIClient(this.useSandbox)
    return config.client
  }

  /**
   * Main sync function - syncs customers bidirectionally
   */
  async syncCustomers(
    syncType: 'scheduled' | 'manual' | 'webhook' | 'checkout' = 'manual'
  ): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      customersCreated: 0,
      customersUpdated: 0,
      customersMatched: 0,
      customersFailed: 0,
      errors: [],
    }

    try {
      // Start sync log
      await this.startSyncLog(syncType)
      result.syncLogId = this.syncLogId

      // 1. Sync Supabase users to Square
      const supabaseResult = await this.syncSupabaseUsersToSquare()
      result.customersCreated += supabaseResult.customersCreated
      result.customersUpdated += supabaseResult.customersUpdated
      result.customersFailed += supabaseResult.customersFailed
      result.errors.push(...supabaseResult.errors)

      // 2. Sync Square customers to Supabase
      const squareResult = await this.syncSquareCustomersToSupabase()
      result.customersMatched += squareResult.customersMatched
      result.customersUpdated += squareResult.customersUpdated
      result.customersFailed += squareResult.customersFailed
      result.errors.push(...squareResult.errors)

      result.success = result.customersFailed === 0

      // Complete sync log
      await this.completeSyncLog(result)

      return result
    } catch (error) {
      console.error('Customer sync failed:', error)
      result.errors.push({ error: String(error) })
      await this.completeSyncLog(result)
      return result
    }
  }

  /**
   * Sync Supabase users to Square
   */
  private async syncSupabaseUsersToSquare(): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      customersCreated: 0,
      customersUpdated: 0,
      customersMatched: 0,
      customersFailed: 0,
      errors: [],
    }

    try {
      // Get unlinked Supabase users
      const { data: unlinkedUsers, error } = await this.supabase
        .from('unlinked_supabase_users')
        .select('*')
        .limit(100) // Process in batches

      if (error) throw error

      for (const user of unlinkedUsers || []) {
        try {
          // Check if customer exists in Square by email
          const existingCustomer = await this.findSquareCustomerByEmail(user.email)

          if (existingCustomer) {
            // Link existing Square customer to Supabase user
            await this.linkSquareCustomer(user.user_id, existingCustomer)
            result.customersMatched++
          } else {
            // Create new Square customer
            const squareCustomer = await this.createSquareCustomer(user)
            if (squareCustomer) {
              await this.linkSquareCustomer(user.user_id, squareCustomer)
              result.customersCreated++
            }
          }
        } catch (userError) {
          console.error(`Failed to sync user ${user.email}:`, userError)
          result.customersFailed++
          result.errors.push({ email: user.email, error: String(userError) })
        }
      }

      // Update existing linked customers
      const { data: linkedCustomers, error: linkedError } = await this.supabase
        .from('square_customers')
        .select('*')
        .eq('sync_status', 'active')
        .lt('last_synced_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Older than 24 hours

      if (!linkedError && linkedCustomers) {
        for (const linkedCustomer of linkedCustomers) {
          try {
            await this.updateSquareCustomer(linkedCustomer)
            result.customersUpdated++
          } catch (updateError) {
            console.error(`Failed to update customer ${linkedCustomer.email}:`, updateError)
            result.customersFailed++
            result.errors.push({ email: linkedCustomer.email, error: String(updateError) })
          }
        }
      }

      result.success = true
    } catch (error) {
      console.error('Failed to sync Supabase users to Square:', error)
      result.errors.push({ error: String(error) })
    }

    return result
  }

  /**
   * Sync Square customers to Supabase
   */
  private async syncSquareCustomersToSupabase(): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      customersCreated: 0,
      customersUpdated: 0,
      customersMatched: 0,
      customersFailed: 0,
      errors: [],
    }

    try {
      // List all Square customers using direct API
      const squareClient = this.getSquareClient()
      const response = await squareClient.listCustomers()

      if (response.customers) {
        for (const squareCustomer of response.customers) {
          try {
            const email = squareCustomer.email_address as string | undefined
            if (!email) continue

            // Check if already linked
            const { data: existingLink } = await this.supabase
              .from('square_customers')
              .select('*')
              .eq('square_customer_id', squareCustomer.id)
              .single()

            if (existingLink) {
              // Update existing link
              await this.updateLinkedCustomer(
                existingLink.id,
                squareCustomer as unknown as SquareCustomer
              )
              result.customersUpdated++
            } else {
              // Try to match with Supabase user by email
              const { data: user } = await this.supabase.rpc('match_square_customer_to_user', {
                p_email: email,
              })

              if (user) {
                // Create new link
                await this.linkSquareCustomer(user, squareCustomer as unknown as SquareCustomer)
                result.customersMatched++
              }
            }
          } catch (customerError) {
            const email = squareCustomer.email_address as string | undefined
            console.error(`Failed to sync Square customer ${email}:`, customerError)
            result.customersFailed++
            result.errors.push({ email, error: String(customerError) })
          }
        }
      }

      result.success = true
    } catch (error) {
      console.error('Failed to sync Square customers to Supabase:', error)
      result.errors.push({ error: String(error) })
    }

    return result
  }

  /**
   * Find Square customer by email using direct API
   */
  private async findSquareCustomerByEmail(email: string): Promise<SquareCustomer | null> {
    try {
      const squareClient = this.getSquareClient()
      const response = await squareClient.searchCustomers({
        query: {
          filter: {
            email_address: {
              exact: email.toLowerCase(),
            },
          },
        },
        limit: 1,
      })

      if (response.customers && response.customers.length > 0) {
        const customer = response.customers[0] as Record<string, unknown>
        return {
          id: customer.id as string,
          givenName: customer.given_name as string | undefined,
          familyName: customer.family_name as string | undefined,
          emailAddress: customer.email_address as string | undefined,
          phoneNumber: customer.phone_number as string | undefined,
          companyName: customer.company_name as string | undefined,
          address: customer.address as Record<string, unknown> | undefined,
          referenceId: customer.reference_id as string | undefined,
          createdAt: customer.created_at as string | undefined,
          updatedAt: customer.updated_at as string | undefined,
        }
      }
    } catch (error) {
      console.error('Failed to search Square customer:', error)
    }

    return null
  }

  /**
   * Create Square customer using direct API
   */
  private async createSquareCustomer(
    user: Record<string, unknown>
  ): Promise<SquareCustomer | null> {
    try {
      const squareClient = this.getSquareClient()
      const fullName = user.full_name as string | undefined
      const response = await squareClient.createCustomer({
        given_name: (user.first_name as string) || fullName?.split(' ')[0],
        family_name: (user.last_name as string) || fullName?.split(' ').slice(1).join(' '),
        email_address: user.email as string,
        phone_number: user.phone as string | undefined,
        reference_id: user.user_id as string, // Store our user ID in Square
      })

      const customer = response.customer as Record<string, unknown>
      return {
        id: customer.id as string,
        givenName: customer.given_name as string | undefined,
        familyName: customer.family_name as string | undefined,
        emailAddress: customer.email_address as string | undefined,
        phoneNumber: customer.phone_number as string | undefined,
        companyName: customer.company_name as string | undefined,
        address: customer.address as Record<string, unknown> | undefined,
        referenceId: customer.reference_id as string | undefined,
        createdAt: customer.created_at as string | undefined,
        updatedAt: customer.updated_at as string | undefined,
      }
    } catch (error) {
      console.error('Square API error creating customer:', error)
      throw error
    }
  }

  /**
   * Update Square customer using direct API
   */
  private async updateSquareCustomer(linkedCustomer: Record<string, unknown>): Promise<void> {
    try {
      // Get latest user data
      const { data: user } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', linkedCustomer.user_id)
        .single()

      if (!user) return

      const squareClient = this.getSquareClient()
      await squareClient.updateCustomer(linkedCustomer.square_customer_id as string, {
        given_name: user.first_name,
        family_name: user.last_name,
        phone_number: user.phone,
      })

      // Update sync timestamp
      await this.supabase
        .from('square_customers')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', linkedCustomer.id)
    } catch (error) {
      console.error('Square API error updating customer:', error)
      throw error
    }
  }

  /**
   * Link Square customer to Supabase user
   */
  private async linkSquareCustomer(userId: string, squareCustomer: SquareCustomer): Promise<void> {
    await this.supabase.from('square_customers').upsert(
      {
        user_id: userId,
        square_customer_id: squareCustomer.id,
        email: squareCustomer.emailAddress!.toLowerCase(),
        given_name: squareCustomer.givenName,
        family_name: squareCustomer.familyName,
        phone_number: squareCustomer.phoneNumber,
        company_name: squareCustomer.companyName,
        address: squareCustomer.address,
        reference_id: squareCustomer.referenceId,
        created_in_square_at: squareCustomer.createdAt,
        updated_in_square_at: squareCustomer.updatedAt,
        last_synced_at: new Date().toISOString(),
        sync_status: 'active',
      },
      {
        onConflict: 'square_customer_id',
      }
    )
  }

  /**
   * Update linked customer data
   */
  private async updateLinkedCustomer(
    linkId: string,
    squareCustomer: SquareCustomer
  ): Promise<void> {
    await this.supabase
      .from('square_customers')
      .update({
        email: squareCustomer.emailAddress!.toLowerCase(),
        given_name: squareCustomer.givenName,
        family_name: squareCustomer.familyName,
        phone_number: squareCustomer.phoneNumber,
        company_name: squareCustomer.companyName,
        address: squareCustomer.address,
        updated_in_square_at: squareCustomer.updatedAt,
        last_synced_at: new Date().toISOString(),
      })
      .eq('id', linkId)
  }

  /**
   * Create or get Square customer for checkout using direct API
   */
  async getOrCreateSquareCustomerForCheckout(
    email: string,
    customerData: {
      givenName?: string
      familyName?: string
      phoneNumber?: string
      companyName?: string
      userId?: string
    }
  ): Promise<string | null> {
    try {
      // If user is authenticated, check for existing link
      if (customerData.userId) {
        const { data: existingLink } = await this.supabase
          .from('square_customers')
          .select('square_customer_id')
          .eq('user_id', customerData.userId)
          .eq('sync_status', 'active')
          .single()

        if (existingLink) {
          return existingLink.square_customer_id
        }
      }

      // Check if Square customer exists by email
      let squareCustomer = await this.findSquareCustomerByEmail(email)

      if (!squareCustomer) {
        // Create new Square customer using direct API
        const squareClient = this.getSquareClient()
        const response = await squareClient.createCustomer({
          email_address: email.toLowerCase(),
          given_name: customerData.givenName,
          family_name: customerData.familyName,
          phone_number: customerData.phoneNumber,
          company_name: customerData.companyName,
          reference_id: customerData.userId,
        })

        const customer = response.customer as Record<string, unknown>
        squareCustomer = {
          id: customer.id as string,
          givenName: customer.given_name as string | undefined,
          familyName: customer.family_name as string | undefined,
          emailAddress: customer.email_address as string | undefined,
          phoneNumber: customer.phone_number as string | undefined,
          companyName: customer.company_name as string | undefined,
          address: customer.address as Record<string, unknown> | undefined,
          referenceId: customer.reference_id as string | undefined,
          createdAt: customer.created_at as string | undefined,
          updatedAt: customer.updated_at as string | undefined,
        }
      }

      // Link to Supabase user if authenticated
      if (customerData.userId && squareCustomer) {
        await this.linkSquareCustomer(customerData.userId, squareCustomer)
      }

      return squareCustomer?.id || null
    } catch (error) {
      console.error('Failed to get/create Square customer for checkout:', error)
      return null
    }
  }

  /**
   * Start sync log
   */
  private async startSyncLog(syncType: string): Promise<void> {
    const { data } = await this.supabase
      .from('square_customer_sync_logs')
      .insert({
        sync_type: syncType,
        sync_direction: 'bidirectional',
        status: 'started',
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    this.syncLogId = data?.id
  }

  /**
   * Complete sync log
   */
  private async completeSyncLog(result: SyncResult): Promise<void> {
    if (!this.syncLogId) return

    const now = new Date()
    const { data: log } = await this.supabase
      .from('square_customer_sync_logs')
      .select('started_at')
      .eq('id', this.syncLogId)
      .single()

    const duration = log ? now.getTime() - new Date(log.started_at).getTime() : 0

    await this.supabase
      .from('square_customer_sync_logs')
      .update({
        status: result.success ? 'completed' : result.customersFailed > 0 ? 'partial' : 'failed',
        customers_created: result.customersCreated,
        customers_updated: result.customersUpdated,
        customers_matched: result.customersMatched,
        customers_failed: result.customersFailed,
        error_details: result.errors,
        completed_at: now.toISOString(),
        duration_ms: duration,
      })
      .eq('id', this.syncLogId)
  }
}
