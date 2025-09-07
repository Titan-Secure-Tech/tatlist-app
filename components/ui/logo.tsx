import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn('flex items-center space-x-2 font-bold text-xl tracking-tight', className)}
    >
      <span className="text-primary">Tatlist</span>
    </Link>
  )
}
