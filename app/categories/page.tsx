import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Grid3x3, Package, Store, Sparkles } from 'lucide-react'
import CategoryCard from '@/components/categories/CategoryCard'

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

// Map categories to Unsplash images with tattoo shop themes
function getCategoryImage(category: string): string {
  const imageMap: Record<string, string> = {
    'Needles & Cartridges':
      'https://images.unsplash.com/photo-1590246814883-57c511e2aa90?w=800&h=800&fit=crop', // Tattoo needles close-up
    'Inks & Colors':
      'https://images.unsplash.com/photo-1611587785105-ad37535b6989?w=800&h=800&fit=crop', // Colorful ink bottles
    'Tattoo Machines':
      'https://images.unsplash.com/photo-1568515387631-c9a793f5b86f?w=800&h=800&fit=crop', // Tattoo machine close-up
    'Tattoo Parts':
      'https://images.unsplash.com/photo-1606902965551-dce093cda6e7?w=800&h=800&fit=crop', // Tattoo equipment parts
    Aftercare: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=800&fit=crop', // Skincare/aftercare products
    'Tattoo Shop Furniture and Supplies':
      'https://images.unsplash.com/photo-1554224311-beee910c1967?w=800&h=800&fit=crop', // Tattoo shop interior
    'Medical Supplies and Sterilization Equipment':
      'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&h=800&fit=crop', // Medical/sterile equipment
    'Art and stencil supplies':
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=800&fit=crop', // Art supplies and stencils
    'Power Supplies':
      'https://images.unsplash.com/photo-1517420879524-86d64ac2f339?w=800&h=800&fit=crop', // Power supply/electronics
    'Tubes & Grips':
      'https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=800&h=800&fit=crop', // Tattoo grips and tubes
    'Body Jewelry':
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop', // Body jewelry/piercings
    Piercing: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&h=800&fit=crop', // Piercing tools
    Cartridges: 'https://images.unsplash.com/photo-1590246814883-57c511e2aa90?w=800&h=800&fit=crop', // Tattoo cartridges
  }

  return (
    imageMap[category] ||
    'https://images.unsplash.com/photo-1568515387631-c9a793f5b86f?w=800&h=800&fit=crop'
  )
}

// Get Unsplash attribution for category images
function getCategoryImageCredit(category: string): { photographer: string; url: string } {
  const creditMap: Record<string, { photographer: string; url: string }> = {
    'Needles & Cartridges': {
      photographer: 'Kristian Angelo',
      url: 'https://unsplash.com/@kristian_angelo',
    },
    'Inks & Colors': { photographer: 'Lucas Lenzi', url: 'https://unsplash.com/@lucaslenzi' },
    'Tattoo Machines': {
      photographer: 'Jhonatan Saavedra Perales',
      url: 'https://unsplash.com/@jhonny_peralvarez',
    },
    'Tattoo Parts': { photographer: 'Allef Vinicius', url: 'https://unsplash.com/@seteales' },
    Aftercare: { photographer: 'Christin Hume', url: 'https://unsplash.com/@christinhumephoto' },
    'Tattoo Shop Furniture and Supplies': {
      photographer: 'Daniil Silantev',
      url: 'https://unsplash.com/@betagamma',
    },
    'Medical Supplies and Sterilization Equipment': {
      photographer: 'Myriam Zilles',
      url: 'https://unsplash.com/@myriamzilles',
    },
    'Art and stencil supplies': {
      photographer: 'Kelli Tungay',
      url: 'https://unsplash.com/@kellitungay',
    },
    'Power Supplies': { photographer: 'Robin Glauser', url: 'https://unsplash.com/@nahakiole' },
    'Tubes & Grips': {
      photographer: 'Ksenia Chernaya',
      url: 'https://unsplash.com/@ksenia_chernaya',
    },
    'Body Jewelry': {
      photographer: 'Amelia Bartlett',
      url: 'https://unsplash.com/@ameliabartlett',
    },
    Piercing: { photographer: 'Septian Simon', url: 'https://unsplash.com/@septiansimon' },
  }

  return creditMap[category] || { photographer: 'Unsplash', url: 'https://unsplash.com' }
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
                  <CategoryCard
                    key={category.name}
                    category={category}
                    slug={categoryToSlug(category.name)}
                    imageUrl={getCategoryImage(category.name)}
                    credit={getCategoryImageCredit(category.name)}
                  />
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
