import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { User, Package } from 'lucide-react'
import { PushNotificationToggle } from '@/components/push-notifications/PushNotificationToggle'
import { ContactPreferenceEditor } from '@/components/user/ContactPreferenceEditor'
import { BusinessHoursEditor } from '@/components/user/BusinessHoursEditor'
import { CustomerInformationForm } from '@/components/profile/customer-information-form'

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile data including contact preferences and business hours
  const { data: profile } = await supabase
    .from('users')
    .select('contact_preference, phone, user_type, business_hours')
    .eq('id', user.id)
    .single()

  // Fetch customer information
  const { data: customerInfo } = await supabase
    .from('customer_information')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const isShopOwner = profile?.user_type === 'shop_owner'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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

      {/* Customer Information (Business & Shipping) */}
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="flex items-center mb-6">
          <Package className="h-6 w-6 text-gray-600 mr-3" />
          <h2 className="text-xl font-bold text-black">Customer Information</h2>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Save your business and shipping information for faster checkout. Your address will be validated
          and checked for delivery eligibility.
        </p>
        <CustomerInformationForm userId={user.id} initialData={customerInfo} />
      </div>

      {/* Contact Preferences */}
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <h2 className="text-xl font-bold text-black mb-4">Contact Preferences</h2>
        <ContactPreferenceEditor
          userId={user.id}
          initialPreference={profile?.contact_preference || null}
          initialPhone={profile?.phone || null}
        />
      </div>

      {/* Business Hours (Shop Owners Only) */}
      {isShopOwner && (
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <h2 className="text-xl font-bold text-black mb-4">Business Hours</h2>
          <BusinessHoursEditor userId={user.id} initialHours={profile?.business_hours || null} />
        </div>
      )}

      {/* Push Notifications Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <h2 className="text-xl font-bold text-black mb-4">Push Notification Settings</h2>
        <PushNotificationToggle />
      </div>
    </div>
  )
}
