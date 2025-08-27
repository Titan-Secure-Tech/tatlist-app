// User and Authentication Types
export interface User {
  id: string
  email: string
  businessName: string
  businessAddress?: string
  taxExemptStatus?: boolean
  taxExemptDocument?: string
  role: 'customer' | 'admin' | 'driver'
  createdAt: Date
  updatedAt: Date
}

// Product Types
export interface Product {
  id: string
  sku: string
  name: string
  description?: string
  price: number
  images: string[]
  category: string
  brand: string
  in_stock: boolean
  stock_quantity?: number
  tags?: string[]
  attachments?: string[]
  source_url?: string
}

// Inventory List Types
export interface InventoryList {
  id: string
  userId: string
  name: string
  products: InventoryListItem[]
  createdAt: Date
  updatedAt: Date
}

export interface InventoryListItem {
  productId: string
  quantity: number
  addedAt: Date
}

// Cart Types
export interface CartItem {
  productId: string
  product: Product
  quantity: number
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  tax: number
  deliveryFee?: number
  total: number
}

// Order Types
export interface Order {
  id: string
  userId: string
  orderNumber: string
  items: OrderItem[]
  subtotal: number
  tax: number
  deliveryFee?: number
  total: number
  fulfillmentType: 'delivery' | 'pickup'
  deliveryAddress?: Address
  status: OrderStatus
  paymentStatus: PaymentStatus
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  productId: string
  product: Product
  quantity: number
  priceAtTime: number
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export type OrderStatus = 
  | 'pending'
  | 'processing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled'

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'

// Delivery Types
export interface Delivery {
  id: string
  orderId: string
  driverId?: string
  estimatedDeliveryTime?: Date
  actualDeliveryTime?: Date
  route?: DeliveryRoute
  status: DeliveryStatus
}

export interface DeliveryRoute {
  stops: DeliveryStop[]
  optimizedOrder: number[]
  totalDistance: number
  estimatedDuration: number
}

export interface DeliveryStop {
  orderId: string
  address: Address
  order: number
}

export type DeliveryStatus = 
  | 'pending'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'failed'