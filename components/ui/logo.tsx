import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn('flex items-center transition-opacity hover:opacity-80', className)}
      aria-label="Tatlist Home"
    >
      <Image
        src="/logo.webp"
        alt="Tatlist - Tampa Tattoo Supply"
        width={2576}
        height={490}
        priority
        className="h-8 w-auto"
      />
    </Link>
  )
}
