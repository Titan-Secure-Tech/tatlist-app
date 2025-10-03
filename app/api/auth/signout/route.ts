import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Signout error:', error)
    }
    
    // Get the origin from the request
    const requestUrl = new URL(request.url)
    const origin = requestUrl.origin
    
    // Create response with redirect to main site
    const response = NextResponse.redirect(new URL('https://tatlist.com'), {
      status: 303, // Use 303 See Other for POST redirect
    })
    
    // Clear any auth cookies
    response.cookies.delete('sb-access-token')
    response.cookies.delete('sb-refresh-token')
    
    return response
  } catch (error) {
    console.error('Signout error:', error)
    // Fallback redirect
    return NextResponse.redirect(new URL('https://tatlist.com'), {
      status: 303,
    })
  }
}

// Support GET method as fallback
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Signout error:', error)
    }
    
    // Get the origin from the request
    const requestUrl = new URL(request.url)
    const origin = requestUrl.origin
    
    // Create response with redirect to main site
    const response = NextResponse.redirect(new URL('https://tatlist.com'), {
      status: 302, // Use 302 for GET redirect
    })
    
    // Clear any auth cookies
    response.cookies.delete('sb-access-token')
    response.cookies.delete('sb-refresh-token')
    
    return response
  } catch (error) {
    console.error('Signout error:', error)
    // Fallback redirect
    return NextResponse.redirect(new URL('https://tatlist.com'), {
      status: 302,
    })
  }
}
