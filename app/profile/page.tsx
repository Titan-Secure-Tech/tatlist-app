import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { User } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="flex items-center mb-6">
          <User className="h-8 w-8 text-gray-600 mr-3" />
          <h1 className="text-2xl font-bold text-black">My Profile</h1>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-black">{user.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
            <p className="text-gray-600 text-sm font-mono">{user.id}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Created</label>
            <p className="text-gray-600">
              {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Sign In</label>
            <p className="text-gray-600">
              {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}