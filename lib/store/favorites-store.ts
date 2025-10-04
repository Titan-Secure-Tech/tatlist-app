import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface FavoritesList {
  id: string
  user_id: string
  name: string
  created_at: string
  updated_at: string
  favorites_list_items?: { count: number }[]
}

export interface FavoritesListItem {
  id: string
  favorites_list_id: string
  product_id: string
  created_at: string
  products?: any
}

interface FavoritesState {
  lists: FavoritesList[]
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchLists: () => Promise<void>
  createList: (name: string) => Promise<FavoritesList | null>
  addToList: (listId: string, productId: string) => Promise<boolean>
  removeFromList: (listId: string, productId: string) => Promise<boolean>
  isProductInList: (listId: string, productId: string) => boolean
  clearError: () => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      lists: [],
      isLoading: false,
      error: null,

      fetchLists: async () => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/favorites/lists')
          if (!response.ok) {
            throw new Error('Failed to fetch favorites lists')
          }
          const data = await response.json()
          set({ lists: data.lists, isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch lists',
            isLoading: false 
          })
        }
      },

      createList: async (name: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/favorites/lists', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to create list')
          }

          const data = await response.json()
          const newList = data.list

          set(state => ({
            lists: [...state.lists, newList],
            isLoading: false
          }))

          return newList
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create list',
            isLoading: false 
          })
          return null
        }
      },

      addToList: async (listId: string, productId: string) => {
        set({ error: null })
        try {
          const response = await fetch(`/api/favorites/lists/${listId}/items`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ product_id: productId }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to add to list')
          }

          // Refresh lists to get updated counts
          await get().fetchLists()
          return true
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add to list'
          })
          return false
        }
      },

      removeFromList: async (listId: string, productId: string) => {
        set({ error: null })
        try {
          const response = await fetch(`/api/favorites/lists/${listId}/items`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ product_id: productId }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to remove from list')
          }

          // Refresh lists to get updated counts
          await get().fetchLists()
          return true
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to remove from list'
          })
          return false
        }
      },

      isProductInList: (listId: string, productId: string) => {
        // This would need to be enhanced to track individual items
        // For now, we'll check via API calls when needed
        return false
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'favorites-store',
      partialize: (state) => ({ lists: state.lists }), // Only persist lists
    }
  )
)