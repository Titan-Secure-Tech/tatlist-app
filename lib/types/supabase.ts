export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      cart_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          quantity: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string | null
          user_id?: string
        }
      }
      email_events: {
        Row: {
          created_at: string | null
          delivery_status_code: number | null
          delivery_status_message: string | null
          domain: string | null
          event_data: Json | null
          event_type: string
          id: string
          message_id: string | null
          reason: string | null
          recipient: string
          severity: string | null
          timestamp: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_status_code?: number | null
          delivery_status_message?: string | null
          domain?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          message_id?: string | null
          reason?: string | null
          recipient: string
          severity?: string | null
          timestamp?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_status_code?: number | null
          delivery_status_message?: string | null
          domain?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          message_id?: string | null
          reason?: string | null
          recipient?: string
          severity?: string | null
          timestamp?: string | null
        }
      }
      products: {
        Row: {
          attachments: string[] | null
          brand: string
          category: string
          created_at: string | null
          description: string | null
          id: string
          images: string[] | null
          in_stock: boolean | null
          name: string
          price: number
          sku: string
          source_url: string | null
          stock_quantity: number | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          attachments?: string[] | null
          brand: string
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          in_stock?: boolean | null
          name: string
          price: number
          sku: string
          source_url?: string | null
          stock_quantity?: number | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          attachments?: string[] | null
          brand?: string
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          in_stock?: boolean | null
          name?: string
          price?: number
          sku?: string
          source_url?: string | null
          stock_quantity?: number | null
          tags?: string[] | null
          updated_at?: string | null
        }
      }
      users: {
        Row: {
          business_address: string | null
          business_name: string
          created_at: string | null
          email: string
          id: string
          role: Database['public']['Enums']['user_role'] | null
          tax_exempt_document: string | null
          tax_exempt_status: boolean | null
          updated_at: string | null
        }
        Insert: {
          business_address?: string | null
          business_name: string
          created_at?: string | null
          email: string
          id: string
          role?: Database['public']['Enums']['user_role'] | null
          tax_exempt_document?: string | null
          tax_exempt_status?: boolean | null
          updated_at?: string | null
        }
        Update: {
          business_address?: string | null
          business_name?: string
          created_at?: string | null
          email?: string
          id?: string
          role?: Database['public']['Enums']['user_role'] | null
          tax_exempt_document?: string | null
          tax_exempt_status?: boolean | null
          updated_at?: string | null
        }
      }
      orders: {
        Row: {
          created_at: string | null
          delivery_address: Json | null
          delivery_fee: number | null
          fulfillment_type: Database['public']['Enums']['fulfillment_type']
          id: string
          notes: string | null
          order_number: string
          payment_intent_id: string | null
          payment_status: Database['public']['Enums']['payment_status'] | null
          status: Database['public']['Enums']['order_status'] | null
          subtotal: number
          tax: number
          total: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          delivery_address?: Json | null
          delivery_fee?: number | null
          fulfillment_type: Database['public']['Enums']['fulfillment_type']
          id?: string
          notes?: string | null
          order_number: string
          payment_intent_id?: string | null
          payment_status?: Database['public']['Enums']['payment_status'] | null
          status?: Database['public']['Enums']['order_status'] | null
          subtotal: number
          tax: number
          total: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          delivery_address?: Json | null
          delivery_fee?: number | null
          fulfillment_type?: Database['public']['Enums']['fulfillment_type']
          id?: string
          notes?: string | null
          order_number?: string
          payment_intent_id?: string | null
          payment_status?: Database['public']['Enums']['payment_status'] | null
          status?: Database['public']['Enums']['order_status'] | null
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string | null
          user_id?: string
        }
      }
    }
    Enums: {
      delivery_status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed'
      fulfillment_type: 'delivery' | 'pickup'
      order_status:
        | 'pending'
        | 'processing'
        | 'ready_for_pickup'
        | 'out_for_delivery'
        | 'delivered'
        | 'completed'
        | 'cancelled'
      payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
      user_role: 'customer' | 'admin' | 'driver'
    }
  }
}

// Convenient type aliases
export type Product = Database['public']['Tables']['products']['Row']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductUpdate = Database['public']['Tables']['products']['Update']

export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type Order = Database['public']['Tables']['orders']['Row']
export type OrderInsert = Database['public']['Tables']['orders']['Insert']
export type OrderUpdate = Database['public']['Tables']['orders']['Update']

export type EmailEvent = Database['public']['Tables']['email_events']['Row']
export type EmailEventInsert = Database['public']['Tables']['email_events']['Insert']
export type EmailEventUpdate = Database['public']['Tables']['email_events']['Update']

export type CartItem = Database['public']['Tables']['cart_items']['Row']
export type CartItemInsert = Database['public']['Tables']['cart_items']['Insert']
export type CartItemUpdate = Database['public']['Tables']['cart_items']['Update']

// Enum types
export type UserRole = Database['public']['Enums']['user_role']
export type OrderStatus = Database['public']['Enums']['order_status']
export type PaymentStatus = Database['public']['Enums']['payment_status']
export type FulfillmentType = Database['public']['Enums']['fulfillment_type']
export type DeliveryStatus = Database['public']['Enums']['delivery_status']
