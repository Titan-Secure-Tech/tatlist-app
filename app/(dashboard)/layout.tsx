import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CartProvider } from '@/components/providers/CartProvider'
import AnimatedNavigation from '@/components/layout/AnimatedNavigation'
import AnnouncementBanner from '@/components/announcement-banner'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const isAdmin = profile?.role === 'admin'

  return (
    <CartProvider>
      <div className="min-h-screen bg-white">
        <AnnouncementBanner />
        <AnimatedNavigation isAdmin={isAdmin} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">{children}</main>
      </div>
    </CartProvider>
  )
}
