import Image from 'next/image'

interface Product {
  handle: string
  title: string
  body: string
  vendor: string
  type: string
  tags: string
  price: string
  imageSrc: string
  imageAlt: string
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price)
    return isNaN(numPrice) ? 'Price unavailable' : `$${numPrice.toFixed(2)}`
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="aspect-square relative overflow-hidden rounded-t-lg bg-gray-100">
        {product.imageSrc ? (
          <Image
            src={product.imageSrc}
            alt={product.imageAlt || product.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.title}</h3>
        {product.vendor && <p className="text-sm text-gray-600 mb-2">{product.vendor}</p>}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-black">{formatPrice(product.price)}</span>
          {product.type && (
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              {product.type}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
