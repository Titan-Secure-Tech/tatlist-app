# Checkout Routes Comparison

## Overview

There are **two active checkout routes** in the application:

1. `/shop/checkout` - **Standard checkout** (currently linked from cart)
2. `/shop/checkout-v2` - **Enhanced B2B checkout** (for licensed tattoo shops)

---

## `/shop/checkout` - Standard Checkout

**Location:** `app/shop/checkout/page.tsx`

**Currently Used:** ✅ Yes - Linked from cart page (`app/(dashboard)/cart/page.tsx:34`)

### Features

**Form Fields:**
- ✅ Customer name
- ✅ Email
- ✅ Phone
- ✅ Delivery address (with Mapbox autocomplete)
- ❌ No business name field
- ❌ No license number field

**Validation:**
- ✅ Mapbox address validation
- ✅ 25-mile delivery radius check from Tampa center
- ✅ Real-time distance calculation
- ✅ Visual validation feedback (green checkmark / red error)

**User Experience:**
- Single-step checkout
- Address validation required before payment
- Validates address is within Tampa Bay delivery area
- Sandbox mode support for testing

**Data Sent to API:**
```typescript
{
  items: cartItems,
  deliveryAddress: {
    line1, line2, city, state, postalCode
  },
  customerInfo: {
    name, email, phone
  }
}
```

---

## `/shop/checkout-v2` - Enhanced B2B Checkout

**Location:** `app/shop/checkout-v2/page.tsx`

**Currently Used:** ❌ No - Only referenced in docs and testing

### Features

**Form Fields:**
- ✅ Business name
- ✅ License number (for tattoo shop verification)
- ✅ Email
- ✅ Phone
- ✅ Delivery address (with Mapbox autocomplete)
- ✅ Fulfillment type (delivery vs pickup)

**Validation:**
- ✅ Mapbox address validation
- ✅ 25-mile delivery radius check
- ✅ License number verification
- ✅ Coordinates and distance stored
- ✅ Business details saved to database

**User Experience:**
- **Two-step checkout:**
  1. Business details & validation
  2. Payment confirmation
- Progress indicator showing current step
- Auto-loads saved customer information from database
- Shows delivery details summary before payment
- Distance-based delivery fee calculation

**Data Sent to API:**
```typescript
{
  items: cartItems,
  deliveryAddress: {
    line1, city, state, postalCode
  },
  customerInfo: {
    name: businessName,
    email,
    phone
  },
  businessInfo: {
    businessName,
    licenseNumber,
    coordinates,
    distance
  },
  fulfillmentType: 'delivery' | 'pickup'
}
```

**Database Integration:**
- Loads from `customer_information` table if exists
- Fallback to `users` table for profile data
- Saves business details for future orders

---

## Key Differences

| Feature | `/shop/checkout` | `/shop/checkout-v2` |
|---------|------------------|---------------------|
| **Target Audience** | General consumers | Licensed tattoo shops (B2B) |
| **Business Name** | ❌ No | ✅ Yes (required) |
| **License Number** | ❌ No | ✅ Yes (required for tattoo shops) |
| **Fulfillment Options** | Delivery only | Delivery or Pickup |
| **Checkout Steps** | 1 (single form) | 2 (business details → payment) |
| **Saved Customer Info** | ❌ No | ✅ Yes (auto-loads from DB) |
| **Delivery Fee** | $5.00 flat | Distance-based (min $5, $0.50/mile) |
| **Progress Indicator** | ❌ No | ✅ Yes (step 1 of 2) |
| **Currently Active** | ✅ Yes | ❌ No (available but not linked) |

---

## Recommendation

### Option 1: Keep Both (Recommended)

**Use Case Separation:**
- **`/shop/checkout`** - For individual/consumer orders
- **`/shop/checkout-v2`** - For B2B/licensed tattoo shop orders

**Implementation:**
1. Update cart page to ask: "Are you a licensed tattoo shop?"
2. Route to appropriate checkout based on answer
3. Keep both flows active

**Pros:**
- Simpler flow for individual customers
- Enhanced verification for business customers
- Flexibility for different customer types

**Cons:**
- Maintains two codebases
- More testing surface area

---

### Option 2: Consolidate to V2 (Future-Proof)

Replace `/shop/checkout` with `/shop/checkout-v2` as the primary checkout.

**Why V2 is Better:**
1. ✅ **License verification** - Critical for business compliance
2. ✅ **Saved customer data** - Better UX for repeat customers
3. ✅ **Two-step flow** - Clearer separation of concerns
4. ✅ **Distance-based pricing** - More accurate delivery fees
5. ✅ **Fulfillment options** - Supports pickup in addition to delivery
6. ✅ **Business info stored** - Better order tracking and customer management

**Migration Steps:**
1. Update cart page link: `/shop/checkout` → `/shop/checkout-v2`
2. Make license number optional for non-business customers
3. Add conditional rendering: Show license field only if "Business customer" selected
4. Test thoroughly with both customer types
5. Archive old checkout after confirmation

**Code Change Required:**
```typescript
// app/(dashboard)/cart/page.tsx:34
const handleCheckout = async () => {
-  window.location.href = '/shop/checkout'
+  window.location.href = '/shop/checkout-v2'
}
```

---

## Current State

**Active Route:** `/shop/checkout` (standard)

**Reason V2 Not Used:**
- According to `CLAUDE.md:17-18`: "Testing the Checkout: Visit `/shop/checkout-v2` for the enhanced checkout with business validation"
- This suggests V2 was built as an enhancement but never switched to production
- Cart still routes to V1

---

## Decision Required

You should choose:

1. **Keep both** - Route based on customer type (B2B vs B2C)
2. **Switch to V2** - Better features, make license optional for consumers
3. **Keep V1** - If license verification and business details aren't needed

**My Recommendation:** Switch to V2 and make the license number field optional. This gives you:
- Better customer data management
- Saved information for repeat customers
- Future-proofing for B2B expansion
- Distance-based pricing
- All features of V1 plus more

If you want to make the switch, I can help update the cart link and make license number optional.
