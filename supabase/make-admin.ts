import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function makeUserAdmin(email: string) {
  try {
    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()
      
    if (userError || !user) {
      console.error('User not found:', email)
      return
    }
    
    // Update user role to admin
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', user.id)
      
    if (updateError) {
      console.error('Error updating user:', updateError)
      return
    }
    
    console.log(`Successfully made ${email} an admin!`)
  } catch (error) {
    console.error('Error:', error)
  }
}

// Get email from command line argument
const email = process.argv[2]

if (!email) {
  console.log('Usage: bun run supabase/make-admin.ts <email>')
  process.exit(1)
}

makeUserAdmin(email).then(() => {
  process.exit(0)
})