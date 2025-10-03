import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Grid3x3, ArrowRight } from 'lucide-react'

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

// Define main category structure based on King Pin Tattoo Supply
const mainCategories = [
  {
    name: 'Tattoo Supplies',
    slug: 'tattoo-supplies',
    icon: '/category-icons/machines.svg',
    description: 'Professional tattoo equipment and supplies',
    subcategories: [
      { name: 'Needles & Cartridges', slug: 'needles' },
      { name: 'Tubes, Tips, Grips & Covers', slug: 'tubes-grips' },
      { name: 'Tattoo Machines', slug: 'machines' },
      { name: 'Power Supplies', slug: 'power-supplies' },
      { name: 'Inks & Colors', slug: 'inks' },
      { name: 'Tattoo Parts', slug: 'tattoo-parts' },
    ]
  },
  {
    name: 'Shop Supplies',
    slug: 'shop-supplies',
    icon: '/category-icons/furniture.svg',
    description: 'Essential shop equipment and furniture',
    subcategories: [
      { name: 'Medical Supplies and Sterilization Equipment', slug: 'medical-supplies' },
      { name: 'Art and stencil supplies', slug: 'art-stencil' },
      { name: 'Tattoo Shop Furniture and Supplies', slug: 'shop-furniture' },
    ]
  },
  {
    name: 'Piercing and Jewelry',
    slug: 'piercing-jewelry',
    icon: '/category-icons/accessories.svg',
    description: 'Professional piercing tools and jewelry',
    subcategories: [
      { name: 'Piercing Tools', slug: 'piercing-tools' },
      { name: 'Body Jewelry', slug: 'body-jewelry' },
      { name: 'Piercing Aftercare', slug: 'piercing-aftercare' },
    ]
  },
  {
    name: 'After Care',
    slug: 'aftercare',
    icon: '/category-icons/aftercare.svg',
    description: 'Healing and aftercare products',
    subcategories: [
      { name: 'Aftercare', slug: 'aftercare' },
      { name: 'Healing Products', slug: 'healing-products' },
      { name: 'Cleaning Supplies', slug: 'cleaning-supplies' },
    ]
  }
]

export default async function CategoriesPage() {
  const supabase = await createClient()

  // Get total product count for each main category by checking subcategories
  const getCategoryCount = async (subcategories: { slug: string }[]) => {
    let totalCount = 0
    
    for (const subcat of subcategories) {
      // Map slug back to actual category name for database lookup
      const categoryName = Object.entries({
        'Art and stencil supplies': 'art-stencil',
        'Medical Supplies and Sterilization Equipment': 'medical-supplies',
        'Tattoo Parts': 'tattoo-parts',
        'Tattoo Shop Furniture and Supplies': 'shop-furniture',
        'Tattoo Machines': 'machines',
        'Needles & Cartridges': 'needles',
        'Inks & Colors': 'inks',
        Aftercare: 'aftercare',
      }).find(([_, slug]) => slug === subcat.slug)?.[0]

      if (categoryName) {
        const { count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('category', categoryName)
        
        totalCount += count || 0
      }
    }
    
    return totalCount
  }

  // Get counts for all main categories
  const categoryData = await Promise.all(
    mainCategories.map(async category => ({
      ...category,
      count: await getCategoryCount(category.subcategories)
    }))
  )

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-black mb-4">Product Categories</h1>
        <p className="text-gray-600 text-lg">Browse our professional tattoo and piercing supplies</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categoryData.map(category => (
          <div
            key={category.slug}
            className="bg-white border-2 border-black rounded-lg overflow-hidden hover:shadow-xl transition-all group"
          >
            {/* Main Category Header */}
            <Link href={`/categories/${category.slug}`} className="block">
              <div className="bg-black text-white p-6 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2 group-hover:text-yellow-400 transition-colors">
                      {category.name}
                    </h2>
                    <p className="text-gray-300 mb-2">{category.description}</p>
                    <p className="text-yellow-400 font-medium">
                      {category.count} {category.count === 1 ? 'product' : 'products'}
                    </p>
                  </div>
                  <div className="ml-4">
                    <Image
                      src={category.icon}
                      alt={`${category.name} icon`}
                      width={60}
                      height={60}
                      className="w-16 h-16 object-contain filter brightness-0 invert group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </div>
                <div className="absolute top-0 right-0 p-4">
                  <ArrowRight className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </Link>

            {/* Subcategories */}
            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-1 gap-2">
                {category.subcategories.map(subcategory => (
                  <Link
                    key={subcategory.slug}
                    href={`/categories/${subcategory.slug}`}
                    className="text-gray-700 hover:text-black hover:bg-white px-3 py-2 rounded transition-colors text-sm border border-transparent hover:border-gray-200"
                  >
                    {subcategory.name}
                  </Link>
                ))}
              </div>
              
              <Link
                href={`/categories/${category.slug}`}
                className="inline-flex items-center text-black font-medium mt-4 hover:underline"
              >
                Shop All {category.name}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center bg-gray-50 rounded-lg p-8">
        <h3 className="text-xl font-bold text-black mb-4">Can't find what you're looking for?</h3>
        <p className="text-gray-600 mb-6">Browse all our products or contact us for assistance</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/products"
            className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
          >
            Browse All Products
          </Link>
          <Link
            href="/contact"
            className="inline-block border-2 border-black text-black px-6 py-3 rounded hover:bg-black hover:text-white transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  )
}
