import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('OAuth callback received:', { code: !!code, origin, next })

  if (code) {
    try {
      const response = NextResponse.redirect(`${origin}${next}`)

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => {
                response.cookies.set(name, value, options)
              })
            },
          },
        }
      )

      console.log('Attempting to exchange code for session...')
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('OAuth exchange error:', error)
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
      }

      console.log('OAuth exchange successful:', { user: data.user?.email })
      return response
    } catch (err) {
      console.error('OAuth callback error:', err)
      return NextResponse.redirect(`${origin}/login?error=callback_error`)
    }
  }

  console.log('No code provided, redirecting to login')
  // If there was an error or no code, redirect to login
  return NextResponse.redirect(`${origin}/login`)
}
