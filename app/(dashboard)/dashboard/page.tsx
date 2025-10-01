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
    .maybeSingle()

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-black mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Manage your orders and browse products.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/products"
          className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="w-8 h-8 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-black">Shop Products</h3>
              <p className="text-sm text-gray-600">Browse our tattoo supplies</p>
            </div>
          </div>
        </Link>

        <Link
          href="/inventory-lists"
          className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="w-8 h-8 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-black">Inventory Lists</h3>
              <p className="text-sm text-gray-600">Manage your inventory</p>
            </div>
          </div>
        </Link>

        <Link
          href="/orders"
          className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="w-8 h-8 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-black">Recent Orders</h3>
              <p className="text-sm text-gray-600">View order history</p>
            </div>
          </div>
        </Link>

        <Link
          href="/promotions"
          className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="w-8 h-8 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-black">Promotions</h3>
              <p className="text-sm text-gray-600">Special offers & deals</p>
            </div>
          </div>
        </Link>

        <Link
          href="/events"
          className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="w-8 h-8 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-black">Events</h3>
              <p className="text-sm text-gray-600">Upcoming conventions</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
