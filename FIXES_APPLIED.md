# Critical Fixes Applied - November 12, 2025

## Issue #1: Production 500 Error on Product Detail Pages ✅ FIXED

**Problem**: Product detail pages returning `DYNAMIC_SERVER_USAGE` error due to PPR configuration conflict.

**Root Cause**:

- `app/(dashboard)/products/[id]/page.tsx` had `experimental_ppr = true` enabled
- This conflicts with dynamic Supabase data fetching

**Solution Applied**:

- Changed from `export const experimental_ppr = true`
- To `export const dynamic = 'force-dynamic'`
- This properly configures Next.js 15 to handle dynamic Supabase calls

**File Changed**: `app/(dashboard)/products/[id]/page.tsx:7`

**Next Steps**:

1. Commit the change
2. Deploy to production: `vercel --prod`
3. Test product pages at `https://tatlist.com/products/[any-product-id]`

---

## Issue #2: Forbidden Error When Saving Client Info ⚠️ NEEDS MIGRATION

**Problem**: User `questions@titansecuretech.com` gets Forbidden error when saving notification preferences.

**Root Cause**:

- The RLS (Row Level Security) policies for `customer_notification_preferences` table may not be applied to production
- Migration `20251110070000_add_geolocation_alerts.sql` needs to be verified/applied

**RLS Policy Needed**:

```sql
CREATE POLICY "Users can manage their own preferences"
  ON customer_notification_preferences
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

**Solution - Apply Migration to Production**:

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/yzpiadsnllrycdfxlneb)
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the RLS fix from below
5. Click **Run**

```sql
-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'customer_notification_preferences'
);

-- If table doesn't exist, run the full migration
-- Otherwise, just check/add the RLS policy

-- Enable RLS if not already enabled
ALTER TABLE customer_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can manage their own preferences" ON customer_notification_preferences;

-- Create the correct policy
CREATE POLICY "Users can manage their own preferences"
  ON customer_notification_preferences
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

### Option 2: Via Supabase CLI

```bash
# Set your database password
export SUPABASE_DB_PASSWORD="your-database-password"

# Link to project
bunx supabase link --project-ref yzpiadsnllrycdfxlneb

# Push migrations
bunx supabase db push --include-all
```

### Option 3: Apply Full Migration

If the `customer_notification_preferences` table doesn't exist at all:

```bash
# Run the full migration file
bunx supabase db push --include-all
```

Or copy the entire contents of `supabase/migrations/20251110070000_add_geolocation_alerts.sql` into the Supabase SQL Editor and run it.

---

## Verification Steps

### Test Product Pages (Issue #1)

```bash
# After deploying
curl -I https://tatlist.com/products/0c01e5eb-262f-47f4-af92-1ea6725bb197
# Should return 200 OK, not 500
```

### Test Notification Preferences (Issue #2)

1. Have `questions@titansecuretech.com` log in
2. Navigate to `/customer/settings/notifications`
3. Try changing any setting and click "Save Preferences"
4. Should see "Preferences updated successfully!" message
5. Should NOT see Forbidden error

---

## Additional Notes

- The product page fix is code-level and just needs deployment
- The notification preferences fix requires database migration
- Both fixes are safe and non-breaking
- No data will be lost

---

## Files Modified

1. ✅ `app/(dashboard)/products/[id]/page.tsx` - Fixed PPR/dynamic conflict
2. ℹ️ `supabase/migrations/20251110070000_add_geolocation_alerts.sql` - Migration needs to be applied

---

## Support

If issues persist after applying these fixes:

1. Check Vercel deployment logs: `vercel logs --follow`
2. Check Supabase logs in dashboard
3. Verify RLS policies in Supabase: Table Editor → `customer_notification_preferences` → RLS Policies tab
