import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  variant?: string
  sku?: string
}

export interface CartStore {
  items: CartItem[]
  isOpen: boolean
  
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (id: string, variant?: string) => void
  updateQuantity: (id: string, quantity: number, variant?: string) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  
  // Computed values
  getTotalItems: () => number
  getTotalPrice: () => number
  getItemCount: (id: string, variant?: string) => number
}

const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const { items } = get()
        const existingItemIndex = items.findIndex(
          (cartItem) => 
            cartItem.id === item.id && 
            cartItem.variant === item.variant
        )

        if (existingItemIndex > -1) {
          const updatedItems = [...items]
          updatedItems[existingItemIndex].quantity += item.quantity || 1
          set({ items: updatedItems })
        } else {
          set({
            items: [...items, { ...item, quantity: item.quantity || 1 }]
          })
        }
      },

      removeItem: (id, variant) => {
        set({
          items: get().items.filter(
            (item) => !(item.id === id && item.variant === variant)
          )
        })
      },

      updateQuantity: (id, quantity, variant) => {
        if (quantity <= 0) {
          get().removeItem(id, variant)
          return
        }

        set({
          items: get().items.map((item) =>
            item.id === id && item.variant === variant
              ? { ...item, quantity }
              : item
          )
        })
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set({ isOpen: !get().isOpen }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        )
      },

      getItemCount: (id, variant) => {
        const item = get().items.find(
          (item) => item.id === id && item.variant === variant
        )
        return item?.quantity || 0
      }
    }),
    {
      name: 'tatlist-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
)

export default useCartStore