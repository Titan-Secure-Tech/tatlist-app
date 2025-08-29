import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase // eslint-disable-line @typescript-eslint/no-unused-vars
    .from('users')
    .select('*')
    .eq('id', user?.id)
    .single()

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-300 via-blue-400 to-blue-500 flex flex-col">
      {/* Header with Tatlist logo */}
      <div className="pt-8 pb-4">
        <h1 className="text-center text-4xl font-black text-orange-400 tracking-wide">TATLIST</h1>
      </div>

      {/* Menu Container */}
      <div className="flex-1 bg-blue-600/80 backdrop-blur-sm mx-4 rounded-t-3xl mt-4 p-6">
        <div className="relative">
          {/* Back button */}
          <button className="absolute right-0 top-0 text-white text-lg font-bold">[back]</button>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">MENU</h2>
          </div>

          {/* Menu Buttons */}
          <div className="space-y-3">
            <Link
              href="/products"
              className="block w-full bg-gradient-to-r from-orange-300 to-orange-400 hover:from-orange-400 hover:to-orange-500 text-black font-bold py-4 px-4 rounded-lg text-xl text-center shadow-lg"
            >
              SHOP PRODUCTS
            </Link>

            <Link
              href="/cart"
              className="block w-full bg-gradient-to-r from-orange-300 to-orange-400 hover:from-orange-400 hover:to-orange-500 text-black font-bold py-4 px-4 rounded-lg text-xl text-center shadow-lg relative"
            >
              SHOPPING CART
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                [1]
              </span>
            </Link>

            <Link
              href="/orders"
              className="block w-full bg-gradient-to-r from-orange-300 to-orange-400 hover:from-orange-400 hover:to-orange-500 text-black font-bold py-4 px-4 rounded-lg text-xl text-center shadow-lg relative"
            >
              RECENT ORDERS
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                [1]
              </span>
            </Link>

            <Link
              href="/promotions"
              className="block w-full bg-gradient-to-r from-orange-300 to-orange-400 hover:from-orange-400 hover:to-orange-500 text-black font-bold py-4 px-4 rounded-lg text-xl text-center shadow-lg relative"
            >
              PROMOTIONS
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                New!
              </span>
            </Link>

            <Link
              href="/events"
              className="block w-full bg-gradient-to-r from-orange-300 to-orange-400 hover:from-orange-400 hover:to-orange-500 text-black font-bold py-4 px-4 rounded-lg text-xl text-center shadow-lg relative"
            >
              EVENTS
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                New!
              </span>
            </Link>

            <Link
              href="/profile"
              className="block w-full bg-gradient-to-r from-orange-300 to-orange-400 hover:from-orange-400 hover:to-orange-500 text-black font-bold py-4 px-4 rounded-lg text-xl text-center shadow-lg"
            >
              MY PROFILE
            </Link>
          </div>
        </div>
      </div>

      {/* Sellable Ad Space */}
      <div className="mx-4 mb-4 bg-black text-white text-center py-4 rounded-lg">
        <span className="text-sm font-bold">(SELLABLE AD SPACE)</span>
      </div>

      {/* Bottom Navigation */}
      <div className="flex justify-between items-center px-8 py-4 bg-blue-600">
        <div className="text-center">
          <div className="text-white text-xs">CONTACT</div>
          <div className="text-white text-xs font-bold">TATLIST</div>
        </div>
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
          <div className="w-6 h-6 bg-blue-600 rounded-full"></div>
        </div>
        <div className="text-center">
          <div className="text-white text-xs">FAVORITE</div>
          <div className="text-white text-xs font-bold">ITEMS</div>
        </div>
      </div>
    </div>
  )
}
