import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'
import { ShoppingCart } from 'lucide-react'

export async function ShopNavigation() {
  const supabase = await createClient()

  // Fetch collections with their categories
  const { data: collections } = await supabase
    .from('collections')
    .select(
      `
      *,
      categories:categories(*)
    `
    )
    .order('sort_order', { ascending: true })
    .limit(10)

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {/* Shop Dropdown */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>Shop</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[800px] gap-3 p-4 md:grid-cols-2 lg:grid-cols-3">
              {collections && collections.length > 0 ? (
                collections.map(collection => (
                  <ListItem
                    key={collection.id}
                    title={collection.name}
                    href={`/shop/${collection.slug}`}
                  >
                    {collection.description || `Browse ${collection.name}`}
                  </ListItem>
                ))
              ) : (
                <li className="col-span-full text-center text-sm text-muted-foreground py-4">
                  No collections available
                </li>
              )}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Direct Links */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/shop" className={navigationMenuTriggerStyle()}>
              All Products
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/shop/checkout" className={navigationMenuTriggerStyle()}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cart
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const ListItem = ({
  className,
  title,
  children,
  href,
  ...props
}: {
  className?: string
  title: string
  children: React.ReactNode
  href: string
}) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}
