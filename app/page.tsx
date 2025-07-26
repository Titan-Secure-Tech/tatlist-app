import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold text-black mb-4">
          Welcome to Tatlist
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your trusted partner for tattoo and body art supplies
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 border border-black text-black rounded-md hover:bg-gray-50 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}