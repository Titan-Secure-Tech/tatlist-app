import Link from 'next/link'
import { Logo } from '@/components/ui/logo'

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container max-w-screen-2xl flex flex-col gap-4 py-10 px-4 sm:px-6 lg:px-8 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-2">
          <Logo />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            POWERED BY{' '}
            <Link
              href="https://titansecuretech.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              TITAN
            </Link>
          </p>
        </div>
        <div className="flex flex-col items-center gap-4 md:ml-auto md:flex-row md:gap-6">
          <Link
            href="/privacy"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy and Terms
          </Link>
          <Link
            href="/contact"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  )
}
