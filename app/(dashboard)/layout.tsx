import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CartProvider } from '@/components/providers/CartProvider'
import DashboardWrapper from '@/components/layout/DashboardWrapper'
import { BottomNav } from '@/components/dashboard/BottomNav'

async function DashboardContent({ children }: { children: React.ReactNode }) {
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

  return <DashboardWrapper isAdmin={isAdmin}>{children}</DashboardWrapper>
}

function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[var(--tatlist-bg-primary)] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--tatlist-brand-400)] mx-auto mb-4"></div>
        <p className="text-[var(--tatlist-text-secondary)]">Loading dashboard...</p>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="tatlist-dark min-h-screen bg-[var(--tatlist-bg-primary)]">
        <Suspense fallback={<DashboardLoading />}>
          <DashboardContent>{children}</DashboardContent>
        </Suspense>
        <BottomNav />
      </div>
    </CartProvider>
  )
}
