import { Bell } from 'lucide-react'

interface DashboardTopBarProps {
  userName?: string
  shopName?: string
  points?: number
}

export function DashboardTopBar({
  userName = 'there',
  shopName = 'Tattoo Shop',
  points,
}: DashboardTopBarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 w-full">
      <div className="flex flex-col">
        <p className="text-sm leading-5 tracking-tight text-[var(--tatlist-text-primary)]">
          Welcome Back 👋, {userName}
        </p>
        <p className="text-xs leading-4 tracking-tight text-[var(--tatlist-text-secondary)]">
          {shopName}
        </p>
      </div>
      <div className="flex items-center gap-4">
        {points !== undefined && (
          <div className="flex items-center gap-1 bg-[var(--tatlist-warning-900)] rounded-full pl-0.5 pr-1.5 py-0.5">
            <span className="text-sm leading-5 tracking-tight font-medium text-[var(--tatlist-text-primary)]">
              {points}
            </span>
          </div>
        )}
        <button aria-label="Notifications">
          <Bell className="size-6 text-[var(--tatlist-text-primary)]" />
        </button>
      </div>
    </div>
  )
}
