'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/types'
import ProductCard from '@/components/products/ProductCard'
import { Loader2, Heart } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const loadFavorites = async () => {
      setIsLoading(true)

      // Check auth
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        // Fetch favorites with product details
        const { data: favoritesData, error } = await supabase
          .from('favorites')
          .select(
            `
            id,
            product_id,
            created_at,
            products (
              id,
              name,
              description,
              price,
              brand,
              category,
              images,
              stock_quantity,
              in_stock
            )
          `
          )
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching favorites:', error)
          return
        }

        // Transform the data to match Product type
        const products = favoritesData?.map(fav => fav.products).filter(Boolean) as Product[]

        setFavorites(products || [])
      } catch (error) {
        console.error('Error loading favorites:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFavorites()
  }, [supabase])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your favorites...</p>
        </div>
      </div>
    )
  }

  // Not logged in state
  if (!user) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="max-w-md text-center space-y-6 px-4">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold">Sign in to view favorites</h1>
          <p className="text-muted-foreground">
            Create an account or sign in to save your favorite products and access them from any
            device.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/register">Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Empty favorites state
  if (favorites.length === 0) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="max-w-md text-center space-y-6 px-4">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold">No favorites yet</h1>
          <p className="text-muted-foreground">
            Start exploring our products and click the heart icon to save your favorites here.
          </p>
          <Button asChild size="lg">
            <Link href="/shop">Browse Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Favorites grid
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Favorites</h1>
        <p className="text-muted-foreground">
          {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {favorites.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
