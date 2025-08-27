import { ProductCard } from '@/components/products/product-card'

const sampleProducts = [
  {
    id: '1',
    name: 'Tattoo Machine Kit',
    price: 299.99,
    originalPrice: 349.99,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    description: 'Professional tattoo machine kit with everything you need to get started.',
    sku: 'TM-001',
    in_stock: true,
  },
  {
    id: '2',
    name: 'Black Ink Set',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=400&fit=crop',
    description: 'High-quality black ink set for professional tattoo work.',
    sku: 'INK-001',
    in_stock: true,
  },
  {
    id: '3',
    name: 'Needle Cartridges',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=400&fit=crop',
    description: 'Sterile needle cartridges for precise tattoo work.',
    sku: 'NC-001',
    in_stock: false,
  },
  {
    id: '4',
    name: 'Tattoo Gloves',
    price: 19.99,
    image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop',
    description: 'Latex-free tattoo gloves for safe and comfortable work.',
    sku: 'GLV-001',
    in_stock: true,
    variant: 'Medium',
  }
]

export default function TestCartPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Cart Functionality Test</h1>
        <p className="text-muted-foreground">
          Test the shopping cart by adding products below. Click the cart icon in the header to view your cart.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sampleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="mt-12 p-6 bg-muted rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Cart Features to Test:</h2>
        <ul className="space-y-2 text-sm">
          <li>✅ Add products to cart</li>
          <li>✅ View cart with drawer/sheet</li>
          <li>✅ Update quantities with +/- buttons</li>
          <li>✅ Remove items from cart</li>
          <li>✅ Cart badge shows total items</li>
          <li>✅ Cart persistence (refresh page to test)</li>
          <li>✅ Empty cart state</li>
          <li>✅ Clear all items</li>
          <li>✅ Product variants support</li>
          <li>✅ Out of stock handling</li>
        </ul>
      </div>
    </div>
  )
}