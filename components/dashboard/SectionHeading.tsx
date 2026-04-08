import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface SectionHeadingProps {
  title: string
  href?: string
  icon?: React.ReactNode
}

export function SectionHeading({ title, href, icon }: SectionHeadingProps) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-1.5">
        <h2 className="font-[family-name:var(--font-heading)] text-xl leading-7 text-[var(--tatlist-text-primary)]">
          {title}
        </h2>
        {icon}
      </div>
      {href && (
        <Link href={href}>
          <ChevronRight className="size-6 text-[var(--tatlist-text-primary)]" />
        </Link>
      )}
    </div>
  )
}
