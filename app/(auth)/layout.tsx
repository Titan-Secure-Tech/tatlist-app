import { Suspense } from 'react'

function AuthLoading() {
  return (
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  )
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-8">
        <Suspense fallback={<AuthLoading />}>{children}</Suspense>
      </div>
    </div>
  )
}
