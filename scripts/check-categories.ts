import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCategories() {
  const { data, error } = await supabase.from('products').select('category')

  if (error) {
    console.error('Error:', error)
    return
  }

  const categories = Array.from(new Set(data.map(p => p.category)))
  console.log('Categories in database:')
  categories.sort().forEach(cat => console.log(`  - "${cat}"`))
}

checkCategories()
