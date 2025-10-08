import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  variant?: string
  image?: string
  description?: string
  currency?: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  incrementItem: (id: string) => void
  decrementItem: (id: string) => void
  clearCart: () => void
  cartCount: number
  cartDetails: Record<string, CartItem>
  totalPrice: number
  formattedTotalPrice: string
}

export const useCartStore = create<CartStore>()(
  persist(
    set => ({
      items: [],
      cartCount: 0,
      cartDetails: {},
      totalPrice: 0,
      formattedTotalPrice: '$0.00',

      addItem: item => {
        set(state => {
          const existingItem = state.items.find(i => i.id === item.id)
          let newItems: CartItem[]

          if (existingItem) {
            newItems = state.items.map(i =>
              i.id === item.id ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i
            )
          } else {
            newItems = [...state.items, { ...item, quantity: item.quantity || 1 }]
          }

          const cartDetails = newItems.reduce(
            (acc, item) => {
              acc[item.id] = item
              return acc
            },
            {} as Record<string, CartItem>
          )

          const cartCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
          const totalPrice = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
          const formattedTotalPrice = `$${(totalPrice / 100).toFixed(2)}`

          return {
            items: newItems,
            cartDetails,
            cartCount,
            totalPrice,
            formattedTotalPrice,
          }
        })
      },

      removeItem: id => {
        set(state => {
          const newItems = state.items.filter(item => item.id !== id)
          const cartDetails = newItems.reduce(
            (acc, item) => {
              acc[item.id] = item
              return acc
            },
            {} as Record<string, CartItem>
          )

          const cartCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
          const totalPrice = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
          const formattedTotalPrice = `$${(totalPrice / 100).toFixed(2)}`

          return {
            items: newItems,
            cartDetails,
            cartCount,
            totalPrice,
            formattedTotalPrice,
          }
        })
      },

      incrementItem: id => {
        set(state => {
          const newItems = state.items.map(item =>
            item.id === id ? { ...item, quantity: item.quantity + 1 } : item
          )

          const cartDetails = newItems.reduce(
            (acc, item) => {
              acc[item.id] = item
              return acc
            },
            {} as Record<string, CartItem>
          )

          const cartCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
          const totalPrice = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
          const formattedTotalPrice = `$${(totalPrice / 100).toFixed(2)}`

          return {
            items: newItems,
            cartDetails,
            cartCount,
            totalPrice,
            formattedTotalPrice,
          }
        })
      },

      decrementItem: id => {
        set(state => {
          const newItems = state.items
            .map(item =>
              item.id === id ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item
            )
            .filter(item => item.quantity > 0)

          const cartDetails = newItems.reduce(
            (acc, item) => {
              acc[item.id] = item
              return acc
            },
            {} as Record<string, CartItem>
          )

          const cartCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
          const totalPrice = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
          const formattedTotalPrice = `$${(totalPrice / 100).toFixed(2)}`

          return {
            items: newItems,
            cartDetails,
            cartCount,
            totalPrice,
            formattedTotalPrice,
          }
        })
      },

      clearCart: () => {
        set({
          items: [],
          cartDetails: {},
          cartCount: 0,
          totalPrice: 0,
          formattedTotalPrice: '$0.00',
        })
      },
    }),
    {
      name: 'tatlist-cart',
    }
  )
)

// Hook that provides same interface as use-shopping-cart
export const useShoppingCart = () => {
  const store = useCartStore()
  return {
    addItem: store.addItem,
    removeItem: store.removeItem,
    incrementItem: store.incrementItem,
    decrementItem: store.decrementItem,
    clearCart: store.clearCart,
    cartCount: store.cartCount,
    cartDetails: store.cartDetails,
    totalPrice: store.totalPrice,
    formattedTotalPrice: store.formattedTotalPrice,
  }
}
