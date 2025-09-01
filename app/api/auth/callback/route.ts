import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  console.log('OAuth callback received:', {
    code: !!code,
    origin,
    next,
    error,
    error_description,
    params: Object.fromEntries(searchParams.entries()),
  })

  // Handle OAuth provider errors
  if (error) {
    console.error('OAuth provider error:', { error, error_description })
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error_description || error)}`
    )
  }

  if (code) {
    // Create initial response that will be modified with cookies
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
            // Update the response with new cookies
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    try {
      console.log('Attempting to exchange code for session...')

      // Exchange the code for a session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('OAuth exchange error:', exchangeError)

        // Check if it's a PKCE error or code already used
        if (
          exchangeError.message?.includes('code verifier') ||
          exchangeError.message?.includes('Authorization code') ||
          exchangeError.message?.includes('already been used')
        ) {
          // This might be a duplicate callback or expired code
          // Try to check if user is already authenticated
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            console.log('User already has session, redirecting to dashboard')
            return NextResponse.redirect(`${origin}/dashboard`)
          }
          
          // Clear auth cookies and redirect to login
          const errorResponse = NextResponse.redirect(
            `${origin}/login?error=${encodeURIComponent('Authentication expired. Please try again.')}`
          )

          // Clear any stale auth cookies
          errorResponse.cookies.delete('sb-auth-token')
          errorResponse.cookies.delete('sb-refresh-token')

          return errorResponse
        }

        return NextResponse.redirect(
          `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`
        )
      }

      console.log('OAuth exchange successful:', { user: data.user?.email })

      // Ensure the session is properly set
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        console.error('No session after exchange')
        return NextResponse.redirect(
          `${origin}/login?error=${encodeURIComponent('Session creation failed. Please try again.')}`
        )
      }

      return response
    } catch (err) {
      console.error('OAuth callback error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed'
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorMessage)}`)
    }
  }

  console.log('No code provided, redirecting to login')
  return NextResponse.redirect(`${origin}/login?error=no_code`)
}
