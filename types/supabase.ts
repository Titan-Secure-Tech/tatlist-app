export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '12.2.12 (cd3cf9e)'
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      business_details: {
        Row: {
          business_name: string
          city: string
          created_at: string | null
          distance_miles: number | null
          email: string
          id: string
          is_validated: boolean | null
          latitude: number | null
          license_number: string
          longitude: number | null
          phone: string
          state: string
          street: string
          updated_at: string | null
          user_id: string | null
          validation_date: string | null
          zip_code: string
        }
        Insert: {
          business_name: string
          city: string
          created_at?: string | null
          distance_miles?: number | null
          email: string
          id?: string
          is_validated?: boolean | null
          latitude?: number | null
          license_number: string
          longitude?: number | null
          phone: string
          state: string
          street: string
          updated_at?: string | null
          user_id?: string | null
          validation_date?: string | null
          zip_code: string
        }
        Update: {
          business_name?: string
          city?: string
          created_at?: string | null
          distance_miles?: number | null
          email?: string
          id?: string
          is_validated?: boolean | null
          latitude?: number | null
          license_number?: string
          longitude?: number | null
          phone?: string
          state?: string
          street?: string
          updated_at?: string | null
          user_id?: string | null
          validation_date?: string | null
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: 'business_details_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'unlinked_supabase_users'
            referencedColumns: ['user_id']
          },
        ]
      }
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
        Relationships: [
          {
            foreignKeyName: 'cart_items_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'cart_items_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      deliveries: {
        Row: {
          actual_delivery_time: string | null
          created_at: string | null
          driver_id: string | null
          estimated_delivery_time: string | null
          id: string
          order_id: string
          route: Json | null
          status: Database['public']['Enums']['delivery_status'] | null
          updated_at: string | null
        }
        Insert: {
          actual_delivery_time?: string | null
          created_at?: string | null
          driver_id?: string | null
          estimated_delivery_time?: string | null
          id?: string
          order_id: string
          route?: Json | null
          status?: Database['public']['Enums']['delivery_status'] | null
          updated_at?: string | null
        }
        Update: {
          actual_delivery_time?: string | null
          created_at?: string | null
          driver_id?: string | null
          estimated_delivery_time?: string | null
          id?: string
          order_id?: string
          route?: Json | null
          status?: Database['public']['Enums']['delivery_status'] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'deliveries_driver_id_fkey'
            columns: ['driver_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'deliveries_order_id_fkey'
            columns: ['order_id']
            isOneToOne: true
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
        ]
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
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'favorites_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'favorites_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      inventory_list_items: {
        Row: {
          added_at: string | null
          id: string
          inventory_list_id: string
          product_id: string
          quantity: number
        }
        Insert: {
          added_at?: string | null
          id?: string
          inventory_list_id: string
          product_id: string
          quantity?: number
        }
        Update: {
          added_at?: string | null
          id?: string
          inventory_list_id?: string
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: 'inventory_list_items_inventory_list_id_fkey'
            columns: ['inventory_list_id']
            isOneToOne: false
            referencedRelation: 'inventory_lists'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'inventory_list_items_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      inventory_lists: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'inventory_lists_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          price_at_time: number
          product_id: string
          quantity: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          price_at_time: number
          product_id: string
          quantity: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          price_at_time?: number
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'order_items_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      orders: {
        Row: {
          business_details_id: string | null
          created_at: string | null
          delivery_address: Json | null
          delivery_distance_miles: number | null
          delivery_fee: number | null
          fulfillment_type: Database['public']['Enums']['fulfillment_type']
          id: string
          notes: string | null
          order_number: string
          payment_intent_id: string | null
          payment_status: Database['public']['Enums']['payment_status'] | null
          square_customer_id: string | null
          status: Database['public']['Enums']['order_status'] | null
          subtotal: number
          tax: number
          total: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_details_id?: string | null
          created_at?: string | null
          delivery_address?: Json | null
          delivery_distance_miles?: number | null
          delivery_fee?: number | null
          fulfillment_type: Database['public']['Enums']['fulfillment_type']
          id?: string
          notes?: string | null
          order_number: string
          payment_intent_id?: string | null
          payment_status?: Database['public']['Enums']['payment_status'] | null
          square_customer_id?: string | null
          status?: Database['public']['Enums']['order_status'] | null
          subtotal: number
          tax: number
          total: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_details_id?: string | null
          created_at?: string | null
          delivery_address?: Json | null
          delivery_distance_miles?: number | null
          delivery_fee?: number | null
          fulfillment_type?: Database['public']['Enums']['fulfillment_type']
          id?: string
          notes?: string | null
          order_number?: string
          payment_intent_id?: string | null
          payment_status?: Database['public']['Enums']['payment_status'] | null
          square_customer_id?: string | null
          status?: Database['public']['Enums']['order_status'] | null
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'orders_business_details_id_fkey'
            columns: ['business_details_id']
            isOneToOne: false
            referencedRelation: 'business_details'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'orders_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
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
        Relationships: []
      }
      push_notifications_log: {
        Row: {
          body: string
          data: Json | null
          error_message: string | null
          id: string
          notification_type: string
          sent_at: string | null
          status: string
          subscription_id: string
          title: string
          user_id: string
        }
        Insert: {
          body: string
          data?: Json | null
          error_message?: string | null
          id?: string
          notification_type: string
          sent_at?: string | null
          status?: string
          subscription_id: string
          title: string
          user_id: string
        }
        Update: {
          body?: string
          data?: Json | null
          error_message?: string | null
          id?: string
          notification_type?: string
          sent_at?: string | null
          status?: string
          subscription_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'push_notifications_log_subscription_id_fkey'
            columns: ['subscription_id']
            isOneToOne: false
            referencedRelation: 'push_subscriptions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'push_notifications_log_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'unlinked_supabase_users'
            referencedColumns: ['user_id']
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          updated_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'push_subscriptions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'unlinked_supabase_users'
            referencedColumns: ['user_id']
          },
        ]
      }
      sandbox_users: {
        Row: {
          created_at: string | null
          email: string
          enabled: boolean | null
          id: string
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          enabled?: boolean | null
          id?: string
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          enabled?: boolean | null
          id?: string
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      square_customer_sync_logs: {
        Row: {
          completed_at: string | null
          customers_created: number | null
          customers_failed: number | null
          customers_matched: number | null
          customers_updated: number | null
          duration_ms: number | null
          error_details: Json | null
          id: string
          metadata: Json | null
          started_at: string | null
          status: string
          sync_direction: string
          sync_type: string
        }
        Insert: {
          completed_at?: string | null
          customers_created?: number | null
          customers_failed?: number | null
          customers_matched?: number | null
          customers_updated?: number | null
          duration_ms?: number | null
          error_details?: Json | null
          id?: string
          metadata?: Json | null
          started_at?: string | null
          status: string
          sync_direction: string
          sync_type: string
        }
        Update: {
          completed_at?: string | null
          customers_created?: number | null
          customers_failed?: number | null
          customers_matched?: number | null
          customers_updated?: number | null
          duration_ms?: number | null
          error_details?: Json | null
          id?: string
          metadata?: Json | null
          started_at?: string | null
          status?: string
          sync_direction?: string
          sync_type?: string
        }
        Relationships: []
      }
      square_customers: {
        Row: {
          address: Json | null
          company_name: string | null
          created_at: string | null
          created_in_square_at: string | null
          email: string
          family_name: string | null
          given_name: string | null
          id: string
          last_synced_at: string | null
          metadata: Json | null
          phone_number: string | null
          reference_id: string | null
          square_customer_id: string
          sync_error: string | null
          sync_status: string | null
          updated_at: string | null
          updated_in_square_at: string | null
          user_id: string
        }
        Insert: {
          address?: Json | null
          company_name?: string | null
          created_at?: string | null
          created_in_square_at?: string | null
          email: string
          family_name?: string | null
          given_name?: string | null
          id?: string
          last_synced_at?: string | null
          metadata?: Json | null
          phone_number?: string | null
          reference_id?: string | null
          square_customer_id: string
          sync_error?: string | null
          sync_status?: string | null
          updated_at?: string | null
          updated_in_square_at?: string | null
          user_id: string
        }
        Update: {
          address?: Json | null
          company_name?: string | null
          created_at?: string | null
          created_in_square_at?: string | null
          email?: string
          family_name?: string | null
          given_name?: string | null
          id?: string
          last_synced_at?: string | null
          metadata?: Json | null
          phone_number?: string | null
          reference_id?: string | null
          square_customer_id?: string
          sync_error?: string | null
          sync_status?: string | null
          updated_at?: string | null
          updated_in_square_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'square_customers_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'unlinked_supabase_users'
            referencedColumns: ['user_id']
          },
        ]
      }
      users: {
        Row: {
          business_address: string | null
          business_name: string
          city: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: Database['public']['Enums']['user_role'] | null
          shop_name: string | null
          state: string | null
          street_address: string | null
          tax_exempt_document: string | null
          tax_exempt_status: boolean | null
          tax_id: string | null
          updated_at: string | null
          user_type: string | null
          zip_code: string | null
        }
        Insert: {
          business_address?: string | null
          business_name: string
          city?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          role?: Database['public']['Enums']['user_role'] | null
          shop_name?: string | null
          state?: string | null
          street_address?: string | null
          tax_exempt_document?: string | null
          tax_exempt_status?: boolean | null
          tax_id?: string | null
          updated_at?: string | null
          user_type?: string | null
          zip_code?: string | null
        }
        Update: {
          business_address?: string | null
          business_name?: string
          city?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: Database['public']['Enums']['user_role'] | null
          shop_name?: string | null
          state?: string | null
          street_address?: string | null
          tax_exempt_document?: string | null
          tax_exempt_status?: boolean | null
          tax_id?: string | null
          updated_at?: string | null
          user_type?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'users_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'unlinked_supabase_users'
            referencedColumns: ['user_id']
          },
        ]
      }
    }
    Views: {
      unlinked_supabase_users: {
        Row: {
          email: string | null
          first_name: string | null
          full_name: string | null
          last_name: string | null
          phone: string | null
          user_created_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_or_create_square_customer_id: {
        Args: { p_user_id: string }
        Returns: string
      }
      match_square_customer_to_user: {
        Args: { p_email: string }
        Returns: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      delivery_status: ['pending', 'assigned', 'in_progress', 'completed', 'failed'],
      fulfillment_type: ['delivery', 'pickup'],
      order_status: [
        'pending',
        'processing',
        'ready_for_pickup',
        'out_for_delivery',
        'delivered',
        'completed',
        'cancelled',
      ],
      payment_status: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      user_role: ['customer', 'admin', 'driver'],
    },
  },
} as const
