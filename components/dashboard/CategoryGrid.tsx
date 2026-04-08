import Link from 'next/link'

interface Category {
  name: string
  href: string
  gradientFrom: string
  gradientTo: string
}

const categories: Category[] = [
  {
    name: 'Tattoo Supplies',
    href: '/shop/tattoo-supplies',
    gradientFrom: '#ecaf77',
    gradientTo: '#ff983c',
  },
  {
    name: 'Medical Supplies',
    href: '/shop/medical-supplies',
    gradientFrom: '#99b7de',
    gradientTo: '#61a7ef',
  },
  { name: 'Cartridges', href: '/shop/cartridges', gradientFrom: '#b8acff', gradientTo: '#8974fd' },
  { name: 'Machines', href: '/shop/machines', gradientFrom: '#f5cb80', gradientTo: '#eeb04d' },
  { name: 'Furniture', href: '/shop/furniture', gradientFrom: '#fda393', gradientTo: '#fe8170' },
  { name: 'Aftercare', href: '/shop/aftercare', gradientFrom: '#97db91', gradientTo: '#64c463' },
]

export function CategoryGrid() {
  return (
    <div className="w-full bg-[var(--tatlist-bg-tertiary)] rounded-2xl p-4 flex flex-col gap-3">
      <h2 className="font-[family-name:var(--font-heading)] text-xl leading-7 text-[var(--tatlist-text-primary)]">
        Shop by Category
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {categories.map(cat => (
          <Link
            key={cat.name}
            href={cat.href}
            className="relative min-h-[80px] rounded-xl p-2.5 flex items-end overflow-hidden transition-transform active:scale-[0.98]"
            style={{
              background: `linear-gradient(to bottom, ${cat.gradientFrom}, ${cat.gradientTo})`,
            }}
          >
            <p className="text-white text-base leading-6 tracking-tight font-medium">{cat.name}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
