import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HeroSection from '@/components/home/HeroSection'
import { OAuthHandler } from '@/components/OAuth-handler'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white">
      <OAuthHandler />

      {/* Hero Section */}
      <HeroSection />
    </div>
  )
}
