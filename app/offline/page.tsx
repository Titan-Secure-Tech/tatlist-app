import { WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Offline | Tatlist',
  description: 'You are currently offline',
}

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <WifiOff className="mb-4 h-16 w-16 text-muted-foreground" />
      <h1 className="mb-2 text-2xl font-bold">You&apos;re Offline</h1>
      <p className="mb-6 text-center text-muted-foreground">
        It looks like you&apos;ve lost your internet connection. Some features may not be available.
      </p>
      <Button onClick={() => window.location.reload()}>Try Again</Button>
    </div>
  )
}
