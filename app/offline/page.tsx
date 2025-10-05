import { WifiOff } from 'lucide-react'
import { ReloadButton } from './reload-button'

export const metadata = {
  title: 'Offline | Tatlist',
  description: 'You are currently offline',
}

// Static page with client component (PPR)
export const experimental_ppr = true

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <WifiOff className="mb-4 h-16 w-16 text-muted-foreground" />
      <h1 className="mb-2 text-2xl font-bold">You&apos;re Offline</h1>
      <p className="mb-6 text-center text-muted-foreground">
        It looks like you&apos;ve lost your internet connection. Some features may not be available.
      </p>
      <ReloadButton />
    </div>
  )
}
