'use client'

import Link from 'next/link'
import Image from 'next/image'

interface CategoryCardProps {
  category: {
    name: string
    count: number
  }
  slug: string
  imageUrl: string
  credit: {
    photographer: string
    url: string
  }
}

export default function CategoryCard({ category, slug, imageUrl, credit }: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${slug}`}
      className="bg-white border-2 border-black rounded-lg overflow-hidden hover:shadow-xl transition-all group"
    >
      <div className="aspect-square bg-gray-100 relative overflow-hidden border-b-2 border-black">
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity z-10" />
        <Image
          src={imageUrl}
          alt={`${category.name} - Professional tattoo supplies`}
          width={800}
          height={800}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Photo credit overlay */}
        <div className="absolute bottom-2 right-2 text-[10px] text-white/70 bg-black/50 px-2 py-1 rounded z-20">
          Photo by{' '}
          <a
            href={credit.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white"
            onClick={e => e.stopPropagation()}
          >
            {credit.photographer}
          </a>
        </div>
      </div>
      <div className="p-6 bg-white">
        <h3 className="text-xl font-bold text-black mb-2 group-hover:underline">{category.name}</h3>
        <p className="text-gray-700 font-medium">
          {category.count} {category.count === 1 ? 'product' : 'products'}
        </p>
      </div>
    </Link>
  )
}
