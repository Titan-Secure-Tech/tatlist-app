'use client'

import { ProductCard } from './ProductCard'
import { SectionHeading } from './SectionHeading'

interface Product {
  id: string
  name: string
  price: string
  image: string
  href?: string
}

interface ProductSectionProps {
  title: string
  href?: string
  icon?: React.ReactNode
  products: Product[]
}

export function ProductSection({ title, href, icon, products }: ProductSectionProps) {
  return (
    <div className="flex flex-col gap-3 w-full">
      <SectionHeading title={title} href={href} icon={icon} />
      <div
        className="flex gap-4 overflow-x-auto scrollbar-none lg:grid lg:grid-cols-4 lg:overflow-visible"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map(product => (
          <ProductCard
            key={product.id}
            name={product.name}
            price={product.price}
            image={product.image}
            href={product.href}
          />
        ))}
      </div>
    </div>
  )
}
