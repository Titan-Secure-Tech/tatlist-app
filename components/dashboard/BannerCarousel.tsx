'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'

interface Banner {
  id: string
  title: string
  subtitle: string
  caption?: string
  image: string
  bgColor?: string
}

const banners: Banner[] = [
  {
    id: '1',
    title: 'Welcome Sale',
    subtitle: '20% on ALL Product',
    caption: 'use code TATlist20',
    image: '/assets/images/benjamin-lehman-5t4qCgtaLGU-unsplash.jpg',
  },
  {
    id: '2',
    title: 'Exclusive Sale',
    subtitle: 'on Cartridges & Needles',
    image: '/assets/images/maxim-hopman-52Kf36w124Y-unsplash.jpg',
  },
  {
    id: '3',
    title: 'Top Quality Products',
    subtitle: 'only on black eye',
    image: '/assets/images/siednji-leon-j5FVVaCkxq4-unsplash.jpg',
  },
]

export function BannerCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const handleScroll = () => {
      const scrollLeft = el.scrollLeft
      const cardWidth = 296
      const index = Math.round(scrollLeft / cardWidth)
      setActiveIndex(Math.min(index, banners.length - 1))
    }

    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="flex flex-col gap-2 items-center w-full">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none w-full"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {banners.map(banner => (
          <div
            key={banner.id}
            className="snap-start shrink-0 w-[280px] sm:w-[312px] h-[175px] rounded-2xl overflow-hidden relative"
          >
            <Image
              src={banner.image}
              alt={banner.title}
              fill
              className="object-cover"
              sizes="312px"
            />
            <div className="absolute inset-0 bg-[var(--tatlist-alpha-light-400)] backdrop-blur-[1px]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center pb-2 px-4">
              <p className="font-[family-name:var(--font-heading)] text-[32px] leading-10 text-red-50 tracking-tight">
                {banner.title}
              </p>
              <p className="font-[family-name:var(--font-heading)] text-lg leading-7 text-white text-center">
                {banner.subtitle}
              </p>
              {banner.caption && (
                <p className="font-[family-name:var(--font-heading)] text-xl leading-7 text-white text-center">
                  {banner.caption}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-1 items-center">
        {banners.map((_, i) => (
          <div
            key={i}
            className={`h-3 rounded-full transition-all ${
              i === activeIndex
                ? 'w-8 bg-[var(--tatlist-alpha-dark-500)]'
                : 'w-3 bg-[var(--tatlist-alpha-dark-200)]'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
