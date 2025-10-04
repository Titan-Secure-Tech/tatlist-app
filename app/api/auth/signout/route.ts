import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get user before signing out to clear their cart data
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id
    
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Signout error:', error)
    }
    
    // Get the origin from the request
    const requestUrl = new URL(request.url)
    const origin = requestUrl.origin
    
    // Create response with redirect
    const response = NextResponse.redirect(new URL('/login', origin), {
      status: 303, // Use 303 See Other for POST redirect
    })
    
    // Clear any auth cookies
    response.cookies.delete('sb-access-token')
    response.cookies.delete('sb-refresh-token')
    
    // Clear user-specific cart cookie if it exists
    if (userId) {
      response.cookies.delete(`tatlist-cart-${userId}`)
    }
    
    return response
  } catch (error) {
    console.error('Signout error:', error)
    // Fallback redirect
    return NextResponse.redirect(new URL('/login', request.url), {
      status: 303,
    })
  }
}

// Support GET method as fallback
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get user before signing out to clear their cart data
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id
    
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Signout error:', error)
    }
    
    // Get the origin from the request
    const requestUrl = new URL(request.url)
    const origin = requestUrl.origin
    
    // Create response with redirect
    const response = NextResponse.redirect(new URL('/login', origin), {
      status: 302, // Use 302 for GET redirect
    })
    
    // Clear any auth cookies
    response.cookies.delete('sb-access-token')
    response.cookies.delete('sb-refresh-token')
    
    // Clear user-specific cart cookie if it exists
    if (userId) {
      response.cookies.delete(`tatlist-cart-${userId}`)
    }
    
    return response
  } catch (error) {
    console.error('Signout error:', error)
    // Fallback redirect
    return NextResponse.redirect(new URL('/login', request.url), {
      status: 302,
    })
  }
}
