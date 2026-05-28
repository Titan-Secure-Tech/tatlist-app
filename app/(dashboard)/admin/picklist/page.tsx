import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PicklistDashboard } from '@/components/admin/PicklistDashboard'

export default async function PicklistPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Delivery Picklist</h1>
          <p className="text-gray-600 mt-2">Manage order fulfillment and prepare deliveries</p>
        </div>
      </div>

      <PicklistDashboard />
    </div>
  )
}
