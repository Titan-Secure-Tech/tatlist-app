import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
        </div>

        <h1 className="text-3xl font-bold text-black mb-4">Order Placed Successfully!</h1>

        <p className="text-gray-600 mb-8">
          Thank you for your order. We&apos;ll send you a confirmation email with your order details
          and tracking information.
        </p>

        <p className="text-sm text-gray-500 mb-8">
          Your order will be delivered within 1-2 hours. Our delivery team will contact you when
          they&apos;re on the way.
        </p>

        <div className="space-y-3">
          <Link
            href="/orders"
            className="block w-full bg-black text-white py-3 rounded hover:bg-gray-800 transition-colors"
          >
            View My Orders
          </Link>

          <Link
            href="/products"
            className="block w-full border border-gray-300 text-gray-700 py-3 rounded hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
