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

  // For unauthenticated users, show only the hero section without shop content
  return (
    <div className="min-h-screen bg-white">
      <OAuthHandler />

      {/* Hero Section */}
      <HeroSection />

      {/* Welcome message for unauthenticated users */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-light text-gray-900 mb-6">
            Welcome to Tampa's Premier Tattoo Supply Partner
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Join our community of professional tattoo artists and access premium supplies, 
            same-day delivery, and exclusive deals tailored for licensed shops in the Tampa Bay area.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 transition-colors"
            >
              Get Started Today
            </a>
            <a
              href="/about"
              className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
