import { createClient } from '@/lib/supabase/server'
import { DashboardTopBar } from '@/components/dashboard/DashboardTopBar'
import { BannerCarousel } from '@/components/dashboard/BannerCarousel'
import { ProductSection } from '@/components/dashboard/ProductSection'
import { PromoBanner } from '@/components/dashboard/PromoBanner'
import { CategoryGrid } from '@/components/dashboard/CategoryGrid'
import { Sparkles } from 'lucide-react'

const recommendedProducts = [
  {
    id: '1',
    name: 'KWADRON CARTRIDGE - Round Liners #12 LONG TAPER',
    price: '$120',
    image: '/assets/images/tatlist-ink-supplies.jpeg',
  },
  {
    id: '2',
    name: 'VERTIX PICO PMU MEMBRANE CARTRIDGE NEEDLES - BOX OF 20',
    price: '$20',
    image: '/assets/images/tatlist-ink-supplies.jpeg',
  },
]

const recentOrders = [
  {
    id: '3',
    name: 'PEAK TRITON CARTRIDGE - #12 ROUND LINER LONG TAPER (5.5MM) - BOX OF 20',
    price: '$120',
    image: '/assets/images/tatlist-ink-supplies.jpeg',
  },
  {
    id: '4',
    name: 'ETERNAL INK - CARAMEL',
    price: '$120',
    image: '/assets/images/tatlist-ink-supplies.jpeg',
  },
]

const limitedOffers = [
  {
    id: '5',
    name: 'KNIFE & FLAG NON-POROUS CORE APRON - PICK COLOR',
    price: '$120',
    image: '/assets/images/tatlist-ink-supplies.jpeg',
  },
  {
    id: '6',
    name: 'SAFERLY VINYL APRON - CLEAR',
    price: '$120',
    image: '/assets/images/tatlist-ink-supplies.jpeg',
  },
]

const popularOrders = [
  {
    id: '7',
    name: 'VLAD BLAD INFINITE LINER PRO COIL MACHINE',
    price: '$600',
    image: '/assets/images/tatlist-ink-supplies.jpeg',
  },
  {
    id: '8',
    name: 'KWADRON CARTRIDGE - Round Liners #12 LONG TAPER',
    price: '$120',
    image: '/assets/images/tatlist-ink-supplies.jpeg',
  },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user?.id)
    .maybeSingle()

  const displayName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'

  return (
    <div className="flex flex-col items-start w-full max-w-[500px] mx-auto lg:max-w-full">
      <DashboardTopBar
        userName={displayName}
        shopName={profile?.shop_name || 'Tattoo Shop'}
        points={120}
      />

      <div className="flex flex-col gap-8 px-4 py-6 w-full pb-32 md:pb-6">
        {/* Banner Carousel */}
        <BannerCarousel />

        {/* Recommendations */}
        <ProductSection
          title="Recommendations for You"
          href="/products"
          products={recommendedProducts}
        />

        {/* Recent Orders */}
        <ProductSection title="Recent Orders" href="/orders" products={recentOrders} />

        {/* Promo Banner */}
        <PromoBanner />

        {/* Limited Time Offers */}
        <ProductSection
          title="Limited Time Offer"
          href="/products"
          icon={<Sparkles className="size-5 text-[var(--tatlist-brand-400)]" />}
          products={limitedOffers}
        />

        {/* Popular Orders */}
        <ProductSection title="Popular Orders" href="/products" products={popularOrders} />

        {/* Shop by Category */}
        <CategoryGrid />
      </div>
    </div>
  )
}
