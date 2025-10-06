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
      // Add common variations that might exist in database
      'Machines',
      'Needles',
      'Inks',
      'Parts',
      'Tubes and Grips',
      'Stencil supplies',
    ],
  },
  {
    name: 'Shop Supplies',
    icon: Store,
    description: 'Professional equipment for your tattoo shop',
    categories: [
      'Tattoo Shop Furniture and Supplies',
      'Medical Supplies and Sterilization Equipment',
      'Shop Furniture',
      'Medical Supplies',
      'Sterilization Equipment',
      'Furniture',
      'Hygiene',
    ],
  },
  {
    name: 'Piercing and Jewelry',
    icon: Sparkles,
    description: 'Body piercing supplies and jewelry',
    categories: [
      'Piercing',
      'Body Jewelry',
      'Piercing Supplies',
      'Jewelry',
    ],
  },
  {
    name: 'After Care',
    icon: Grid3x3,
    description: 'Healing and aftercare products',
    categories: [
      'Aftercare',
      'After Care',
      'Healing Products',
      'Cleaning Supplies',
      'Tattoo Aftercare',
      'Piercing Aftercare',
    ],
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
    'Power Supplies': 'power-supplies',
    'Tubes & Grips': 'tubes-grips',
    'Aftercare': 'aftercare',
    'After Care': 'aftercare',
    'Piercing': 'piercing',
    'Body Jewelry': 'body-jewelry',
    'Machines': 'machines',
    'Needles': 'needles',
    'Inks': 'inks',
    'Parts': 'parts',
    'Tubes and Grips': 'tubes-grips',
    'Stencil supplies': 'stencil-supplies',
    'Shop Furniture': 'shop-furniture',
    'Medical Supplies': 'medical-supplies',
    'Sterilization Equipment': 'sterilization-equipment',
    'Furniture': 'furniture',
    'Hygiene': 'hygiene',
    'Piercing Supplies': 'piercing-supplies',
    'Jewelry': 'jewelry',
    'Healing Products': 'healing-products',
    'Cleaning Supplies': 'cleaning-supplies',
    'Tattoo Aftercare': 'tattoo-aftercare',
    'Piercing Aftercare': 'piercing-aftercare',
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
    'Power Supplies': 'power_supplies',
    'Tubes & Grips': 'tubes_grips',
    'Art and stencil supplies': 'stencil',
    'Aftercare': 'aftercare',
    'After Care': 'aftercare',
    'Tattoo Shop Furniture and Supplies': 'furniture',
    'Medical Supplies and Sterilization Equipment': 'hygiene',
    'Piercing': 'accessories',
    'Body Jewelry': 'accessories',
    // Common variations
    'Machines': 'machines',
    'Needles': 'needles',
    'Inks': 'ink',
    'Parts': 'accessories',
    'Tubes and Grips': 'tubes_grips',
    'Stencil supplies': 'stencil',
    'Shop Furniture': 'furniture',
    'Medical Supplies': 'hygiene',
    'Sterilization Equipment': 'hygiene',
    'Furniture': 'furniture',
    'Hygiene': 'hygiene',
    'Piercing Supplies': 'accessories',
    'Jewelry': 'accessories',
    'Healing Products': 'aftercare',
    'Cleaning Supplies': 'hygiene',
    'Tattoo Aftercare': 'aftercare',
    'Piercing Aftercare': 'aftercare',
    'Cartridges': 'cartridges',
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
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-black text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Product Categories</h1>
            <p className="text-lg text-gray-300">
              Browse our comprehensive selection of professional tattoo and piercing supplies
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Category Groups */}
        <div className="space-y-16">
          {categoryGroups.map(group => {
            const Icon = group.icon
            // Filter categories that exist in the database
            const groupCategories = categoryData.filter(cat => group.categories.includes(cat.name))
            
            // Calculate total products in this group
            const totalProducts = groupCategories.reduce((sum, cat) => sum + cat.count, 0)

            // Skip group if no categories have products, but show placeholder for empty groups
            const shouldShow = groupCategories.length > 0 || categoryData.length === 0

            if (!shouldShow) return null

            return (
              <div key={group.name} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Group Header */}
                <div className="bg-black text-white p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-yellow-500 rounded-lg">
                        <Icon className="w-8 h-8 text-black" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-yellow-500">{group.name}</h2>
                        <p className="text-gray-300">{group.description}</p>
                      </div>
                    </div>
                    {totalProducts > 0 && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-yellow-500">{totalProducts}</div>
                        <div className="text-sm text-gray-300">
                          {totalProducts === 1 ? 'product' : 'products'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Categories in this group */}
                <div className="p-6">
                  {groupCategories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {groupCategories.map(category => (
                        <Link
                          key={category.name}
                          href={`/categories/${categoryToSlug(category.name)}`}
                          className="bg-gray-50 border-2 border-gray-200 rounded-lg overflow-hidden hover:border-black hover:shadow-xl transition-all group"
                        >
                          <div className="aspect-square bg-white p-8 border-b-2 border-gray-200 relative overflow-hidden group-hover:border-black">
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
                            <h3 className="text-lg font-bold text-black mb-2 group-hover:text-yellow-600">
                              {category.name}
                            </h3>
                            <p className="text-gray-700 font-medium">
                              {category.count} {category.count === 1 ? 'product' : 'products'}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>Products coming soon to this category</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center bg-black text-white py-12 rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Can't find what you're looking for?</h3>
          <p className="text-gray-300 mb-6">Browse all our products or contact us for special requests</p>
          <div className="space-x-4">
            <Link 
              href="/products" 
              className="inline-block bg-yellow-500 text-black px-6 py-3 rounded font-bold hover:bg-yellow-400 transition-colors"
            >
              View All Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
