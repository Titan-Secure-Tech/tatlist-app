import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        'flex items-center space-x-3 font-bold text-xl tracking-tight transition-opacity hover:opacity-80',
        className
      )}
      aria-label="Tatlist Home"
    >
      <Image
        src="/tatlist-logo.webp"
        alt="Tatlist - Tampa Tattoo Supply"
        width={150}
        height={50}
        className="h-10 w-auto object-contain"
        priority
        quality={95}
        sizes="(max-width: 768px) 120px, 150px"
      />
    </Link>
  )
}
