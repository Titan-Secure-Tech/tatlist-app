import { Suspense } from 'react'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { Toaster } from '@/components/ui/sonner'
import { CartProvider } from '@/components/providers/CartProvider'
import { SandboxProvider } from '@/lib/contexts/sandbox-context'
import { PWAInstaller } from '@/components/PWAInstaller'
import { OfficeStatusBanner } from '@/components/office-status-banner'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Tatlist | Tampa Tattoo Supply Delivery & Logistics | Black Eye Products',
  description:
    "Tampa Bay's premier delivery and logistics service for Black Eye Products Tattoo Supply. Same-day delivery of professional tattoo inks, needles, machines, and equipment to licensed tattoo shops in Tampa, St. Petersburg, Clearwater, and Hillsborough County.",
  keywords:
    'Tampa tattoo delivery, tattoo supply delivery Tampa FL, Black Eye Products Tampa, tattoo supply logistics Tampa, same-day tattoo delivery, Tampa Bay tattoo delivery, Hillsborough County tattoo delivery, St Petersburg tattoo delivery, Clearwater tattoo delivery, tattoo shop delivery Florida',
  authors: [{ name: 'Tatlist' }],
  applicationName: 'Tatlist - Tattoo Supply Delivery',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [
      { rel: 'icon', url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { rel: 'icon', url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Tatlist',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'Tatlist | Tattoo Supply Delivery & Logistics for Black Eye Products',
    description:
      "Tampa Bay's premier delivery and logistics service for Black Eye Products Tattoo Supply. Serving licensed tattoo shops throughout Tampa, St. Petersburg, and Clearwater with fast, reliable same-day delivery.",
    type: 'website',
    locale: 'en_US',
    siteName: 'Tatlist - Tattoo Supply Delivery',
    images: [{ url: 'https://tatlist.com/tatlist-logo.webp', width: 600, height: 200 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tatlist | Tattoo Supply Delivery & Logistics',
    description:
      'Delivery and logistics service for Black Eye Products Tattoo Supply. Same-day delivery to licensed Tampa Bay tattoo shops.',
    images: ['https://tatlist.com/tatlist-logo.webp'],
  },
  alternates: {
    canonical: 'https://tatlist.com',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.webmanifest',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#FFB347',
}

function SiteHeaderFallback() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center">
          <div className="animate-pulse h-8 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    </header>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SandboxProvider>
          <CartProvider>
            <PWAInstaller />
            <div className="relative flex min-h-screen flex-col">
              <Suspense fallback={<SiteHeaderFallback />}>
                <SiteHeader />
              </Suspense>
              <OfficeStatusBanner />
              <main className="flex-1 container max-w-screen-2xl px-4 sm:px-6 lg:px-8">
                {children}
              </main>
              <SiteFooter />
            </div>
            <Toaster />
            <Analytics />
            <SpeedInsights />
          </CartProvider>
        </SandboxProvider>
      </body>
    </html>
  )
}
