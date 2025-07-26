import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user?.id)
    .single()

  return (
    <div>
      <h1 className="text-2xl font-bold text-black mb-4">Dashboard</h1>
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Welcome back, {profile?.business_name || 'User'}!</h2>
        <p className="text-gray-600">Start building your inventory list by browsing our products.</p>
      </div>
    </div>
  )
}