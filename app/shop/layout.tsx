import Link from 'next/link'
import { CartProvider } from '@/components/providers/CartProvider'
import { AuthShopHeader } from '@/components/navigation/auth-shop-header'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-white">
        {/* Unified Authenticated Header */}
        <AuthShopHeader />

        {/* Main Content */}
        <main>{children}</main>

        {/* Footer */}
        <footer className="border-t mt-16">
          <div className="container py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-semibold mb-4">Shop</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link href="/shop" className="hover:text-foreground">
                      All Products
                    </Link>
                  </li>
                  <li>
                    <Link href="/shop/checkout" className="hover:text-foreground">
                      Checkout
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Support</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link href="/contact" className="hover:text-foreground">
                      Contact Us
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link href="/about" className="hover:text-foreground">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:text-foreground">
                      Terms
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Connect</h3>
                <p className="text-sm text-muted-foreground">
                  Professional tattoo supplies delivered to Tampa Bay
                </p>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} Tatlist. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </CartProvider>
  )
}
