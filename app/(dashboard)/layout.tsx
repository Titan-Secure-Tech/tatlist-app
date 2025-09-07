import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CartProvider } from '@/components/providers/CartProvider'
import DashboardWrapper from '@/components/layout/DashboardWrapper'

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
        <DashboardWrapper isAdmin={isAdmin}>{children}</DashboardWrapper>
      </div>
    </CartProvider>
  )
}
