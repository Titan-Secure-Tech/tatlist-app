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
        Relationships: [
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
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
