import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
// import { Header } from "@/components/layout/header";
import { Toaster } from '@/components/ui/sonner'
import { CartProvider } from '@/components/providers/CartProvider'
import { PWAInstaller } from '@/components/PWAInstaller'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Tampa Tattoo Supply | Professional Tattoo Supplies & Equipment | Tatlist',
  description:
    "Tampa Bay's premier tattoo supply delivery service. Professional tattoo inks, needles, machines, and equipment for licensed tattoo shops in Tampa, St. Petersburg, Clearwater, and Hillsborough County. Same-day delivery available.",
  keywords:
    'Tampa tattoo supply, tattoo supplies Tampa FL, tattoo equipment Tampa, tattoo ink Tampa, tattoo needles Tampa, Tampa Bay tattoo supplies, Hillsborough County tattoo supply, St Petersburg tattoo supplies, Clearwater tattoo supplies, professional tattoo supplies Florida',
  authors: [{ name: 'Tatlist' }],
  openGraph: {
    title: 'Tampa Tattoo Supply | Professional Equipment & Same-Day Delivery',
    description:
      "Tampa Bay's trusted source for professional tattoo supplies. Serving licensed tattoo shops throughout Tampa, St. Petersburg, and Clearwater with fast, reliable delivery.",
    type: 'website',
    locale: 'en_US',
    siteName: 'Tatlist - Tampa Tattoo Supply',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tampa Tattoo Supply | Professional Equipment & Delivery',
    description:
      'Professional tattoo supplies for Tampa Bay artists. Same-day delivery to licensed shops.',
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
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#FFB347',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <CartProvider>
          <PWAInstaller />
          <main className="min-h-screen">{children}</main>
          <Toaster />
        </CartProvider>
      </body>
    </html>
  )
}
