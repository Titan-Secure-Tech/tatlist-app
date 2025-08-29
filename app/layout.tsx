import type { Metadata } from 'next'
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
  title: 'Tatlist - Tattoo Supply Ordering Platform',
  description:
    'Professional tattoo supply ordering platform with integrated inventory management and seamless Lucky Supply integration',
  manifest: '/manifest.json',
  themeColor: '#FFB347',
  viewport:
    'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Tatlist',
  },
  icons: {
    apple: '/icons/icon-192x192.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FFB347" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Tatlist" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
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
