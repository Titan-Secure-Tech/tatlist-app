import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Grid3x3, Package, Store, Sparkles } from 'lucide-react'

// Category group configuration following kingpintattoosupply.com pattern
const categoryGroups = [
  {
    name: 'Tattoo Supplies',
    icon: Package,
    description: 'Essential tools and materials for tattooing',
    categories: [
      'Tattoo Machines',
      'Needles & Cartridges',
      'Inks & Colors',
      'Tattoo Parts',
      'Power Supplies',
      'Tubes & Grips',
      'Art and stencil supplies',
    ],
  },
  {
    name: 'Shop Supplies',
    icon: Store,
    description: 'Professional equipment for your tattoo shop',
    categories: [
      'Tattoo Shop Furniture and Supplies',
      'Medical Supplies and Sterilization Equipment',
      'Aftercare',
    ],
  },
  {
    name: 'Piercing and Jewelry',
    icon: Sparkles,
    description: 'Body piercing supplies and jewelry',
    categories: ['Piercing', 'Body Jewelry'],
  },
]

// Helper function to create URL-friendly slugs from category names
function categoryToSlug(category: string): string {
  const slugMap: Record<string, string> = {
    'Art and stencil supplies': 'art-stencil',
    'Medical Supplies and Sterilization Equipment': 'medical-supplies',
    'Tattoo Parts': 'tattoo-parts',
    'Tattoo Shop Furniture and Supplies': 'shop-furniture',
    'Tattoo Machines': 'machines',
    'Needles & Cartridges': 'needles',
    'Inks & Colors': 'inks',
    Aftercare: 'aftercare',
    Piercing: 'piercing',
    'Body Jewelry': 'body-jewelry',
  }

  return slugMap[category] || category.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

// Map categories to icon filenames
function getCategoryIcon(category: string): string {
  const iconMap: Record<string, string> = {
    'Needles & Cartridges': 'needles',
    'Inks & Colors': 'ink',
    'Tattoo Machines': 'machines',
    'Tattoo Parts': 'accessories',
    Aftercare: 'aftercare',
    'Tattoo Shop Furniture and Supplies': 'furniture',
    'Medical Supplies and Sterilization Equipment': 'hygiene',
    'Art and stencil supplies': 'stencil',
    'Power Supplies': 'power_supplies',
    'Tubes & Grips': 'tubes_grips',
    Cartridges: 'cartridges',
  }

  const iconName = iconMap[category] || 'accessories'
  return `/category-icons/${iconName}.svg`
}

export default async function CategoriesPage() {
  const supabase = await createClient()

  // Fetch unique categories from products
  const { data: categories, error } = await supabase
    .from('products')
    .select('category')
    .order('category')

  // Get unique categories and count
  const uniqueCategories = categories
    ? Array.from(new Set(categories.map(item => item.category)))
    : []

  // Get count for each category
  const categoryData = await Promise.all(
    uniqueCategories.map(async category => {
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category', category)

      return { name: category, count: count || 0 }
    })
  )

  if (error || categoryData.length === 0) {
    return (
      <div className="text-center py-12">
        <Grid3x3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold text-black mb-4">No Categories Found</h1>
        <p className="text-gray-600 mb-8">
          Product categories will appear here once products are added
        </p>
        <Link
          href="/products"
          className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
        >
          Browse All Products
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-black mb-4">Product Categories</h1>
        <p className="text-lg text-gray-600">
          Browse our comprehensive selection of professional tattoo and piercing supplies
        </p>
      </div>

      {/* Category Groups */}
      <div className="space-y-16">
        {categoryGroups.map(group => {
          const Icon = group.icon
          // Filter categories that exist in the database
          const groupCategories = categoryData.filter(cat => group.categories.includes(cat.name))

          // Skip group if no categories have products
          if (groupCategories.length === 0) return null

          return (
            <div key={group.name}>
              {/* Group Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-black rounded-lg">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-black">{group.name}</h2>
                  <p className="text-gray-600">{group.description}</p>
                </div>
              </div>

              {/* Categories in this group */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupCategories.map(category => (
                  <Link
                    key={category.name}
                    href={`/categories/${categoryToSlug(category.name)}`}
                    className="bg-white border-2 border-black rounded-lg overflow-hidden hover:shadow-xl transition-all group"
                  >
                    <div className="aspect-square bg-white p-8 border-b-2 border-black relative overflow-hidden">
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity" />
                      <Image
                        src={getCategoryIcon(category.name)}
                        alt={`${category.name} icon`}
                        width={200}
                        height={200}
                        className="w-full h-full object-contain filter group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6 bg-white">
                      <h3 className="text-xl font-bold text-black mb-2 group-hover:underline">
                        {category.name}
                      </h3>
                      <p className="text-gray-700 font-medium">
                        {category.count} {category.count === 1 ? 'product' : 'products'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-12 text-center">
        <Link href="/products" className="inline-block text-black underline hover:no-underline">
          View all products →
        </Link>
      </div>
    </div>
  )
}
