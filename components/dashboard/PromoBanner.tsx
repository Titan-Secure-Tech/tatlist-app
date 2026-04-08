import { Truck } from 'lucide-react'

export function PromoBanner() {
  return (
    <div className="w-full rounded-xl bg-[var(--tatlist-brand-700)] h-[104px] overflow-hidden relative">
      <div className="absolute right-5 top-4 opacity-20">
        <Truck className="size-16 text-white" />
      </div>
      <p className="absolute left-5 top-1/2 -translate-y-1/2 font-[family-name:var(--font-heading)] text-xl leading-6 text-white w-[160px]">
        Get free delivery over $400 shopping
      </p>
    </div>
  )
}
