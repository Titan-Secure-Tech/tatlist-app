'use client'

import { useShoppingCart } from 'use-shopping-cart'
import { Trash2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'

export default function CartPage() {
  const {
    cartDetails,
    removeItem,
    incrementItem,
    decrementItem,
    clearCart,
    formattedTotalPrice,
    cartCount,
  } = useShoppingCart()

  const handleCheckout = async () => {
    try {
      // For now, we'll just log the cart
      // Later we'll integrate with Square
      console.log('Checkout with cart:', cartDetails)
      toast.info('Square payment integration coming soon!')
    } catch (error) {
      console.error('Checkout error:', error)
    }
  }

  if (cartCount === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-black mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">Start adding products to your cart</p>
        <Link
          href="/products"
          className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Shopping Cart</h1>
        <button onClick={clearCart} className="text-red-600 hover:text-red-700 text-sm">
          Clear Cart
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-200">
          {Object.values(cartDetails || {}).map(item => (
            <div key={item.id} className="p-4 flex items-center space-x-4">
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="object-cover rounded"
                />
              )}

              <div className="flex-1">
                <h3 className="font-semibold text-black">{item.name}</h3>
                <p className="text-gray-600">${(item.price / 100).toFixed(2)} each</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => decrementItem(item.id)}
                  className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                >
                  -
                </button>
                <span className="w-12 text-center">{item.quantity}</span>
                <button
                  onClick={() => incrementItem(item.id)}
                  className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                >
                  +
                </button>
              </div>

              <div className="text-right">
                <p className="font-semibold">${((item.price * item.quantity) / 100).toFixed(2)}</p>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                className="text-red-600 hover:text-red-700"
                aria-label={`Remove ${item.name} from cart`}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-2xl font-bold text-black">{formattedTotalPrice}</span>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full bg-black text-white py-3 rounded hover:bg-gray-800 transition-colors"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  )
}
