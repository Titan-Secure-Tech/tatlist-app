import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Navigation() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user?.id)
    .single()
  
  const isAdmin = profile?.role === 'admin'

  return (
    <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
      <Link
        href="/dashboard"
        className="border-transparent text-gray-700 hover:border-gray-300 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
      >
        Dashboard
      </Link>
      <Link
        href="/products"
        className="border-transparent text-gray-700 hover:border-gray-300 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
      >
        Products
      </Link>
      <Link
        href="/inventory-lists"
        className="border-transparent text-gray-700 hover:border-gray-300 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
      >
        Inventory Lists
      </Link>
      <Link
        href="/cart"
        className="border-transparent text-gray-700 hover:border-gray-300 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
      >
        Cart
      </Link>
      <Link
        href="/orders"
        className="border-transparent text-gray-700 hover:border-gray-300 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
      >
        Orders
      </Link>
      <Link
        href="/profile"
        className="border-transparent text-gray-700 hover:border-gray-300 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
      >
        Profile
      </Link>
      {isAdmin && (
        <Link
          href="/admin"
          className="border-transparent text-gray-700 hover:border-gray-300 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
        >
          Admin
        </Link>
      )}
    </div>
  )
}