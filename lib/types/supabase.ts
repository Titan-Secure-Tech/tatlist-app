export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      alert_thresholds: {
        Row: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          created_at: string | null
          distance_miles: number | null
          eta_minutes: number | null
          id: string
          is_enabled: boolean | null
          notification_channel:
            | Database["public"]["Enums"]["notification_channel"]
            | null
          priority: number | null
          updated_at: string | null
        }
        Insert: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          created_at?: string | null
          distance_miles?: number | null
          eta_minutes?: number | null
          id?: string
          is_enabled?: boolean | null
          notification_channel?:
            | Database["public"]["Enums"]["notification_channel"]
            | null
          priority?: number | null
          updated_at?: string | null
        }
        Update: {
          alert_type?: Database["public"]["Enums"]["alert_type"]
          created_at?: string | null
          distance_miles?: number | null
          eta_minutes?: number | null
          id?: string
          is_enabled?: boolean | null
          notification_channel?:
            | Database["public"]["Enums"]["notification_channel"]
            | null
          priority?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_email: string | null
          author_name: string
          canonical_url: string | null
          categories: string[] | null
          content: string
          created_at: string
          event_address: string | null
          event_city: string | null
          event_contact_email: string | null
          event_contact_name: string | null
          event_contact_phone: string | null
          event_end_time: string | null
          event_location: string | null
          event_registration_url: string | null
          event_start_time: string | null
          event_state: string | null
          event_zip: string | null
          excerpt: string | null
          featured_image_alt: string | null
          featured_image_url: string | null
          id: string
          meta_description: string | null
          meta_keywords: string[] | null
          meta_title: string | null
          og_description: string | null
          og_image_url: string | null
          og_title: string | null
          post_type: string
          published_at: string | null
          slug: string
          status: string
          tags: string[] | null
          title: string
          twitter_card_type: string | null
          updated_at: string
          view_count: number | null
        }
        Insert: {
          author_email?: string | null
          author_name?: string
          canonical_url?: string | null
          categories?: string[] | null
          content: string
          created_at?: string
          event_address?: string | null
          event_city?: string | null
          event_contact_email?: string | null
          event_contact_name?: string | null
          event_contact_phone?: string | null
          event_end_time?: string | null
          event_location?: string | null
          event_registration_url?: string | null
          event_start_time?: string | null
          event_state?: string | null
          event_zip?: string | null
          excerpt?: string | null
          featured_image_alt?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          og_description?: string | null
          og_image_url?: string | null
          og_title?: string | null
          post_type?: string
          published_at?: string | null
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          twitter_card_type?: string | null
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          author_email?: string | null
          author_name?: string
          canonical_url?: string | null
          categories?: string[] | null
          content?: string
          created_at?: string
          event_address?: string | null
          event_city?: string | null
          event_contact_email?: string | null
          event_contact_name?: string | null
          event_contact_phone?: string | null
          event_end_time?: string | null
          event_location?: string | null
          event_registration_url?: string | null
          event_start_time?: string | null
          event_state?: string | null
          event_zip?: string | null
          excerpt?: string | null
          featured_image_alt?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          og_description?: string | null
          og_image_url?: string | null
          og_title?: string | null
          post_type?: string
          published_at?: string | null
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          twitter_card_type?: string | null
          updated_at?: string
          view_count?: number | null
        }
        Relationships: []
      }
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
            foreignKeyName: "business_details_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "unlinked_supabase_users"
            referencedColumns: ["user_id"]
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
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_notification_preferences: {
        Row: {
          created_at: string | null
          email_enabled: boolean | null
          enable_arrival_alerts: boolean | null
          enable_distance_alerts: boolean | null
          enable_eta_alerts: boolean | null
          id: string
          phone_number: string | null
          phone_verified: boolean | null
          preferred_channel:
            | Database["public"]["Enums"]["notification_channel"]
            | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          sms_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_enabled?: boolean | null
          enable_arrival_alerts?: boolean | null
          enable_distance_alerts?: boolean | null
          enable_eta_alerts?: boolean | null
          id?: string
          phone_number?: string | null
          phone_verified?: boolean | null
          preferred_channel?:
            | Database["public"]["Enums"]["notification_channel"]
            | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sms_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_enabled?: boolean | null
          enable_arrival_alerts?: boolean | null
          enable_distance_alerts?: boolean | null
          enable_eta_alerts?: boolean | null
          id?: string
          phone_number?: string | null
          phone_verified?: boolean | null
          preferred_channel?:
            | Database["public"]["Enums"]["notification_channel"]
            | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sms_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      deliveries: {
        Row: {
          actual_delivery_time: string | null
          created_at: string | null
          current_latitude: number | null
          current_longitude: number | null
          delivery_notes: string | null
          driver_id: string | null
          estimated_arrival_time: string | null
          estimated_delivery_time: string | null
          id: string
          location_updated_at: string | null
          order_id: string
          proof_photo_url: string | null
          proof_signature_data: string | null
          recipient_name: string | null
          route: Json | null
          status: Database["public"]["Enums"]["delivery_status"] | null
          updated_at: string | null
        }
        Insert: {
          actual_delivery_time?: string | null
          created_at?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          delivery_notes?: string | null
          driver_id?: string | null
          estimated_arrival_time?: string | null
          estimated_delivery_time?: string | null
          id?: string
          location_updated_at?: string | null
          order_id: string
          proof_photo_url?: string | null
          proof_signature_data?: string | null
          recipient_name?: string | null
          route?: Json | null
          status?: Database["public"]["Enums"]["delivery_status"] | null
          updated_at?: string | null
        }
        Update: {
          actual_delivery_time?: string | null
          created_at?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          delivery_notes?: string | null
          driver_id?: string | null
          estimated_arrival_time?: string | null
          estimated_delivery_time?: string | null
          id?: string
          location_updated_at?: string | null
          order_id?: string
          proof_photo_url?: string | null
          proof_signature_data?: string | null
          recipient_name?: string | null
          route?: Json | null
          status?: Database["public"]["Enums"]["delivery_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_location_history: {
        Row: {
          accuracy: number | null
          created_at: string | null
          delivery_id: string
          driver_id: string
          heading: number | null
          id: string
          latitude: number
          longitude: number
          recorded_at: string | null
          speed: number | null
        }
        Insert: {
          accuracy?: number | null
          created_at?: string | null
          delivery_id: string
          driver_id: string
          heading?: number | null
          id?: string
          latitude: number
          longitude: number
          recorded_at?: string | null
          speed?: number | null
        }
        Update: {
          accuracy?: number | null
          created_at?: string | null
          delivery_id?: string
          driver_id?: string
          heading?: number | null
          id?: string
          latitude?: number
          longitude?: number
          recorded_at?: string | null
          speed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_location_history_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_location_history_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
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
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      geolocation_alerts: {
        Row: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          created_at: string | null
          customer_id: string
          delivery_id: string
          destination_latitude: number | null
          destination_longitude: number | null
          distance_miles: number | null
          driver_latitude: number | null
          driver_longitude: number | null
          email_sent_at: string | null
          error_message: string | null
          eta_minutes: number | null
          id: string
          order_id: string
          sent_via: Database["public"]["Enums"]["notification_channel"] | null
          sms_sent_at: string | null
          status: Database["public"]["Enums"]["alert_status"] | null
          threshold_id: string
          triggered_at: string | null
        }
        Insert: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          created_at?: string | null
          customer_id: string
          delivery_id: string
          destination_latitude?: number | null
          destination_longitude?: number | null
          distance_miles?: number | null
          driver_latitude?: number | null
          driver_longitude?: number | null
          email_sent_at?: string | null
          error_message?: string | null
          eta_minutes?: number | null
          id?: string
          order_id: string
          sent_via?: Database["public"]["Enums"]["notification_channel"] | null
          sms_sent_at?: string | null
          status?: Database["public"]["Enums"]["alert_status"] | null
          threshold_id: string
          triggered_at?: string | null
        }
        Update: {
          alert_type?: Database["public"]["Enums"]["alert_type"]
          created_at?: string | null
          customer_id?: string
          delivery_id?: string
          destination_latitude?: number | null
          destination_longitude?: number | null
          distance_miles?: number | null
          driver_latitude?: number | null
          driver_longitude?: number | null
          email_sent_at?: string | null
          error_message?: string | null
          eta_minutes?: number | null
          id?: string
          order_id?: string
          sent_via?: Database["public"]["Enums"]["notification_channel"] | null
          sms_sent_at?: string | null
          status?: Database["public"]["Enums"]["alert_status"] | null
          threshold_id?: string
          triggered_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "geolocation_alerts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "geolocation_alerts_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "geolocation_alerts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "geolocation_alerts_threshold_id_fkey"
            columns: ["threshold_id"]
            isOneToOne: false
            referencedRelation: "alert_thresholds"
            referencedColumns: ["id"]
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
            foreignKeyName: "inventory_list_items_inventory_list_id_fkey"
            columns: ["inventory_list_id"]
            isOneToOne: false
            referencedRelation: "inventory_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_list_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
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
            foreignKeyName: "inventory_lists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          order_id: string
          packed_at: string | null
          packed_by: string | null
          picked_at: string | null
          picked_by: string | null
          price_at_time: number
          product_id: string
          quantity: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id: string
          packed_at?: string | null
          packed_by?: string | null
          picked_at?: string | null
          picked_by?: string | null
          price_at_time: number
          product_id: string
          quantity: number
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          packed_at?: string | null
          packed_by?: string | null
          picked_at?: string | null
          picked_by?: string | null
          price_at_time?: number
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_packed_by_fkey"
            columns: ["packed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_picked_by_fkey"
            columns: ["picked_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          from_status: Database["public"]["Enums"]["order_status"] | null
          id: string
          metadata: Json | null
          notes: string | null
          order_id: string
          to_status: Database["public"]["Enums"]["order_status"]
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          from_status?: Database["public"]["Enums"]["order_status"] | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          order_id: string
          to_status: Database["public"]["Enums"]["order_status"]
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          from_status?: Database["public"]["Enums"]["order_status"] | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          order_id?: string
          to_status?: Database["public"]["Enums"]["order_status"]
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          business_details_id: string | null
          created_at: string | null
          delivery_address: Json | null
          delivery_date: string | null
          delivery_distance_miles: number | null
          delivery_fee: number | null
          fulfillment_type: Database["public"]["Enums"]["fulfillment_type"]
          id: string
          notes: string | null
          order_number: string
          payment_intent_id: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          pickup_location: string | null
          square_customer_id: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          status_notes: string | null
          subtotal: number
          tax: number
          total: number
          updated_at: string | null
          updated_by: string | null
          user_id: string
        }
        Insert: {
          business_details_id?: string | null
          created_at?: string | null
          delivery_address?: Json | null
          delivery_date?: string | null
          delivery_distance_miles?: number | null
          delivery_fee?: number | null
          fulfillment_type: Database["public"]["Enums"]["fulfillment_type"]
          id?: string
          notes?: string | null
          order_number: string
          payment_intent_id?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          pickup_location?: string | null
          square_customer_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          status_notes?: string | null
          subtotal: number
          tax: number
          total: number
          updated_at?: string | null
          updated_by?: string | null
          user_id: string
        }
        Update: {
          business_details_id?: string | null
          created_at?: string | null
          delivery_address?: Json | null
          delivery_date?: string | null
          delivery_distance_miles?: number | null
          delivery_fee?: number | null
          fulfillment_type?: Database["public"]["Enums"]["fulfillment_type"]
          id?: string
          notes?: string | null
          order_number?: string
          payment_intent_id?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          pickup_location?: string | null
          square_customer_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          status_notes?: string | null
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_business_details_id_fkey"
            columns: ["business_details_id"]
            isOneToOne: false
            referencedRelation: "business_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
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
          square_catalog_id: string | null
          square_updated_at: string | null
          square_variation_id: string | null
          stock_quantity: number | null
          sync_source: string | null
          tags: string[] | null
          updated_at: string | null
          variations: Json | null
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
          square_catalog_id?: string | null
          square_updated_at?: string | null
          square_variation_id?: string | null
          stock_quantity?: number | null
          sync_source?: string | null
          tags?: string[] | null
          updated_at?: string | null
          variations?: Json | null
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
          square_catalog_id?: string | null
          square_updated_at?: string | null
          square_variation_id?: string | null
          stock_quantity?: number | null
          sync_source?: string | null
          tags?: string[] | null
          updated_at?: string | null
          variations?: Json | null
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
            foreignKeyName: "push_notifications_log_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "push_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_notifications_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "unlinked_supabase_users"
            referencedColumns: ["user_id"]
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
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "unlinked_supabase_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      route_stops: {
        Row: {
          address: Json
          arrival_time: string | null
          created_at: string | null
          delivery_id: string
          departure_time: string | null
          earliest_arrival: string | null
          id: string
          latest_arrival: string | null
          latitude: number
          longitude: number
          notes: string | null
          original_stop_number: number
          route_id: string
          status: Database["public"]["Enums"]["route_stop_status"] | null
          stop_number: number
          time_spent_minutes: number | null
          updated_at: string | null
        }
        Insert: {
          address: Json
          arrival_time?: string | null
          created_at?: string | null
          delivery_id: string
          departure_time?: string | null
          earliest_arrival?: string | null
          id?: string
          latest_arrival?: string | null
          latitude: number
          longitude: number
          notes?: string | null
          original_stop_number: number
          route_id: string
          status?: Database["public"]["Enums"]["route_stop_status"] | null
          stop_number: number
          time_spent_minutes?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: Json
          arrival_time?: string | null
          created_at?: string | null
          delivery_id?: string
          departure_time?: string | null
          earliest_arrival?: string | null
          id?: string
          latest_arrival?: string | null
          latitude?: number
          longitude?: number
          notes?: string | null
          original_stop_number?: number
          route_id?: string
          status?: Database["public"]["Enums"]["route_stop_status"] | null
          stop_number?: number
          time_spent_minutes?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "route_stops_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_stops_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          actual_end_time: string | null
          actual_start_time: string | null
          created_at: string | null
          created_by: string | null
          driver_id: string
          end_location: Json | null
          estimated_end_time: string | null
          estimated_start_time: string | null
          id: string
          name: string | null
          optimized_waypoint_order: number[] | null
          route_geometry: Json | null
          start_location: Json | null
          status: Database["public"]["Enums"]["route_status"] | null
          total_distance_miles: number | null
          total_duration_minutes: number | null
          turn_by_turn_directions: Json | null
          updated_at: string | null
        }
        Insert: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          created_at?: string | null
          created_by?: string | null
          driver_id: string
          end_location?: Json | null
          estimated_end_time?: string | null
          estimated_start_time?: string | null
          id?: string
          name?: string | null
          optimized_waypoint_order?: number[] | null
          route_geometry?: Json | null
          start_location?: Json | null
          status?: Database["public"]["Enums"]["route_status"] | null
          total_distance_miles?: number | null
          total_duration_minutes?: number | null
          turn_by_turn_directions?: Json | null
          updated_at?: string | null
        }
        Update: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          created_at?: string | null
          created_by?: string | null
          driver_id?: string
          end_location?: Json | null
          estimated_end_time?: string | null
          estimated_start_time?: string | null
          id?: string
          name?: string | null
          optimized_waypoint_order?: number[] | null
          route_geometry?: Json | null
          start_location?: Json | null
          status?: Database["public"]["Enums"]["route_status"] | null
          total_distance_miles?: number | null
          total_duration_minutes?: number | null
          turn_by_turn_directions?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
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
            foreignKeyName: "square_customers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "unlinked_supabase_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      users: {
        Row: {
          business_address: string | null
          business_hours: Json | null
          business_name: string
          city: string | null
          contact_preference:
            | Database["public"]["Enums"]["contact_preference"]
            | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
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
          business_hours?: Json | null
          business_name: string
          city?: string | null
          contact_preference?:
            | Database["public"]["Enums"]["contact_preference"]
            | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
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
          business_hours?: Json | null
          business_name?: string
          city?: string | null
          contact_preference?:
            | Database["public"]["Enums"]["contact_preference"]
            | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
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
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "unlinked_supabase_users"
            referencedColumns: ["user_id"]
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
      calculate_route_completion: {
        Args: { p_route_id: string }
        Returns: number
      }
      check_alert_already_sent: {
        Args: {
          p_alert_type: Database["public"]["Enums"]["alert_type"]
          p_delivery_id: string
          p_minutes_threshold?: number
        }
        Returns: boolean
      }
      generate_slug: { Args: { title: string }; Returns: string }
      get_customer_notification_preferences: {
        Args: { p_user_id: string }
        Returns: {
          created_at: string | null
          email_enabled: boolean | null
          enable_arrival_alerts: boolean | null
          enable_distance_alerts: boolean | null
          enable_eta_alerts: boolean | null
          id: string
          phone_number: string | null
          phone_verified: boolean | null
          preferred_channel:
            | Database["public"]["Enums"]["notification_channel"]
            | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          sms_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "customer_notification_preferences"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_driver_active_deliveries: {
        Args: { driver_user_id: string }
        Returns: {
          customer_name: string
          delivery_address: Json
          delivery_id: string
          delivery_status: Database["public"]["Enums"]["delivery_status"]
          estimated_delivery_time: string
          item_count: number
          order_id: string
          order_number: string
          order_status: Database["public"]["Enums"]["order_status"]
          total: number
        }[]
      }
      get_driver_active_routes: {
        Args: { p_driver_id: string }
        Returns: {
          completed_stops: number
          estimated_end_time: string
          route_id: string
          route_name: string
          route_status: Database["public"]["Enums"]["route_status"]
          total_distance_miles: number
          total_duration_minutes: number
          total_stops: number
        }[]
      }
      get_next_route_stop: { Args: { p_route_id: string }; Returns: string }
      get_or_create_square_customer_id: {
        Args: { p_user_id: string }
        Returns: string
      }
      is_in_quiet_hours: { Args: { p_user_id: string }; Returns: boolean }
      match_square_customer_to_user: {
        Args: { p_email: string }
        Returns: string
      }
    }
    Enums: {
      alert_status: "pending" | "sent" | "failed" | "skipped"
      alert_type:
        | "eta_10_minutes"
        | "eta_5_minutes"
        | "arriving_now"
        | "distance_2_miles"
        | "distance_1_mile"
        | "distance_half_mile"
      contact_preference: "sms" | "email" | "both"
      delivery_status:
        | "pending"
        | "assigned"
        | "in_progress"
        | "completed"
        | "failed"
      fulfillment_type: "delivery" | "pickup"
      notification_channel: "email" | "sms" | "both"
      order_status:
        | "pending"
        | "processing"
        | "ready_for_pickup"
        | "out_for_delivery"
        | "delivered"
        | "completed"
        | "cancelled"
      payment_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "refunded"
      route_status: "draft" | "active" | "completed" | "cancelled"
      route_stop_status:
        | "pending"
        | "enroute"
        | "arrived"
        | "completed"
        | "skipped"
      user_role: "customer" | "admin" | "driver"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      alert_status: ["pending", "sent", "failed", "skipped"],
      alert_type: [
        "eta_10_minutes",
        "eta_5_minutes",
        "arriving_now",
        "distance_2_miles",
        "distance_1_mile",
        "distance_half_mile",
      ],
      contact_preference: ["sms", "email", "both"],
      delivery_status: [
        "pending",
        "assigned",
        "in_progress",
        "completed",
        "failed",
      ],
      fulfillment_type: ["delivery", "pickup"],
      notification_channel: ["email", "sms", "both"],
      order_status: [
        "pending",
        "processing",
        "ready_for_pickup",
        "out_for_delivery",
        "delivered",
        "completed",
        "cancelled",
      ],
      payment_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "refunded",
      ],
      route_status: ["draft", "active", "completed", "cancelled"],
      route_stop_status: [
        "pending",
        "enroute",
        "arrived",
        "completed",
        "skipped",
      ],
      user_role: ["customer", "admin", "driver"],
    },
  },
} as const

