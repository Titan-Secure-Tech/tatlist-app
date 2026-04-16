import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OfficeStatusToggle } from '@/components/admin/office-status-toggle'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.is_admin || false

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Account Settings */}
        <div className="bg-background border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Account Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <p className="text-foreground">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">User ID</label>
              <p className="text-muted-foreground text-sm font-mono">{user.id}</p>
            </div>
          </div>
        </div>

        {/* Admin Settings */}
        {isAdmin && (
          <div className="bg-background border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Admin Settings</h2>
            <div className="space-y-4">
              <OfficeStatusToggle />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
