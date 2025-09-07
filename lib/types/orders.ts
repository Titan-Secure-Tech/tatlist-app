export interface Order {
  id: string
  order_number: string
  square_order_id?: string | null
  square_payment_id?: string | null
  user_id?: string | null
  customer_email: string
  customer_name: string
  customer_phone?: string | null
  status: OrderStatus
  payment_status: PaymentStatus
  total_amount: number
  subtotal: number
  delivery_fee: number
  tax_amount: number
  currency: string
  items: OrderItem[]
  delivery_address?: DeliveryAddress | null
  payment_method?: string | null
  square_receipt_url?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
  paid_at?: string | null
  fulfilled_at?: string | null
  cancelled_at?: string | null
}

export interface OrderItem {
  id?: string
  order_id?: string
  product_id?: string | null
  square_catalog_id?: string | null
  square_variation_id?: string | null
  product_name: string
  variant_name?: string | null
  sku?: string | null
  quantity: number
  unit_price: number
  total_price: number
}

export interface DeliveryAddress {
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country?: string
}

export interface CustomerInfo {
  name: string
  email: string
  phone?: string
}

export type OrderStatus = 
  | 'pending'
  | 'processing'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded'

export interface CreateOrderRequest {
  items: Array<{
    id: string
    name: string
    variant?: string
    price: number
    quantity: number
    sku?: string
  }>
  deliveryAddress: DeliveryAddress
  customerInfo: CustomerInfo
  notes?: string
}

export interface CreateOrderResponse {
  orderId: string
  orderNumber: string
  paymentLink: string
  order: Order
  total: number
}

export interface SquareWebhookEvent {
  id: string
  event_id: string
  event_type: string
  merchant_id?: string
  location_id?: string
  entity_id?: string
  payload: any
  processed?: boolean
  processed_at?: string | null
  error?: string | null
  created_at: string
}

export interface SquareSyncLog {
  id: string
  sync_type: 'products' | 'orders' | 'inventory'
  status: 'started' | 'completed' | 'failed'
  items_synced: number
  items_failed: number
  error_details?: string | null
  started_at: string
  completed_at?: string | null
  metadata?: any
}