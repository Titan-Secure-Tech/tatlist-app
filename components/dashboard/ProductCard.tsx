'use client'

import Image from 'next/image'
import { Heart, Plus } from 'lucide-react'

interface ProductCardProps {
  name: string
  price: string
  image: string
  href?: string
}

export function ProductCard({ name, price, image, href = '#' }: ProductCardProps) {
  return (
    <a href={href} className="flex flex-col gap-1.5 shrink-0 w-[280px] sm:w-[303px] lg:w-full">
      <div className="relative aspect-video bg-[var(--tatlist-bg-card)] rounded-2xl overflow-hidden">
        <Image src={image} alt={name} fill className="object-contain p-4" sizes="303px" />
        <button
          className="absolute top-3 right-3 size-7 rounded-full bg-gradient-to-b from-neutral-50 to-neutral-200 flex items-center justify-center"
          aria-label="Add to favorites"
        >
          <Heart className="size-4 text-neutral-600" />
        </button>
      </div>
      <div className="flex gap-3 items-start">
        <div className="flex-1 min-w-0 flex flex-col gap-2 justify-center h-20">
          <p className="text-[var(--tatlist-text-muted)] text-base leading-6 tracking-tight line-clamp-2">
            {name}
          </p>
          <p className="text-[var(--tatlist-text-primary)] text-base leading-6 tracking-tight font-medium">
            {price}
          </p>
        </div>
        <button
          className="shrink-0 size-7 rounded-full bg-gradient-to-b from-[var(--tatlist-brand-400)] to-[var(--tatlist-brand-600)] flex items-center justify-center"
          aria-label="Add to cart"
        >
          <Plus className="size-4 text-white" />
        </button>
      </div>
    </a>
  )
}
