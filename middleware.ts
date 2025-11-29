import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Block common bot/scanner paths (WordPress, PHP, etc.)
  const blockedPaths = [
    '/wp-content',
    '/wp-includes',
    '/wp-admin',
    '/wordpress',
    '/wp-login',
    '/.env',
    '/phpmyadmin',
    '/xmlrpc.php',
    '/admin',
    '/.git',
    '/backup',
    '/backups',
  ]

  if (blockedPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return new NextResponse('Not Found', { status: 404 })
  }

  // Skip middleware for static files, API routes, and Apple Pay verification
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/.well-known') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - .well-known (Apple Pay and other verification files)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|\\.well-known|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
