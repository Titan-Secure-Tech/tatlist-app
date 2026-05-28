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
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 60"
        className="h-12 w-auto"
        aria-label="Tatlist - Tampa Tattoo Supply"
      >
        <defs>
          <style>
            {`
              .tatlist-text {
                font-family: 'Arial Black', sans-serif;
                font-weight: 900;
                font-size: 36px;
                fill: currentColor;
              }
              .tagline {
                font-family: Arial, sans-serif;
                font-size: 8px;
                fill: #666666;
                letter-spacing: 1px;
              }
            `}
          </style>
        </defs>

        {/* Main Logo Text */}
        <text x="100" y="35" textAnchor="middle" className="tatlist-text">
          TATLIST
        </text>

        {/* Tagline */}
        <text x="100" y="50" textAnchor="middle" className="tagline">
          TAMPA TATTOO SUPPLY
        </text>

        {/* Decorative elements */}
        <rect x="10" y="25" width="20" height="4" fill="#FFB347" rx="2" />
        <rect x="170" y="25" width="20" height="4" fill="#FFB347" rx="2" />
      </svg>
    </Link>
  )
}
