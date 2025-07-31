# Tatlist App Architecture

## Overview

The Tatlist application uses a modern tech stack with clear separation of concerns across different services. This document outlines how all components integrate together.

## Tech Stack Integration

### Frontend Stack
- **Next.js 15** - App Router, React 19, TypeScript
- **Zustand** - Client-side state management (shopping cart)
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - UI components

### Backend Services
- **Supabase** - Authentication, database, real-time features
- **Square API** - Payment processing (checkout only)

## Data Flow Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Supabase      │    │   Square API    │
│   (Next.js)     │    │   (Auth & DB)   │    │   (Payments)    │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Zustand Cart  │◄──►│ • User Auth     │    │ • Payment       │
│ • UI Components │    │ • Product Data  │    │   Processing    │
│ • Route Handlers│    │ • Order History │    │ • Transaction   │
│                 │    │ • User Profiles │    │   Records       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Component Responsibilities

### Zustand Cart Store (`/lib/store/cart.ts`)
**Purpose**: Client-side shopping cart state management

**Features**:
- Add/remove/update cart items
- Persist cart data in localStorage
- Calculate totals and item counts
- Handle product variants
- Cart UI state (open/closed)

**Integration Points**:
- Reads product data from Supabase
- Sends cart totals to Square for payment
- Creates order records in Supabase after successful payment

### Supabase Integration

#### Authentication
- User login/signup/logout
- Session management
- Protected routes and API endpoints

#### Database Schema (Planned)
```sql
-- Users (handled by Supabase Auth)
-- Products
products (
  id: uuid PRIMARY KEY,
  name: text,
  description: text,
  price: decimal,
  image_url: text,
  sku: text,
  inventory_count: integer,
  created_at: timestamp
)

-- Orders
orders (
  id: uuid PRIMARY KEY,
  user_id: uuid REFERENCES auth.users(id),
  total_amount: decimal,
  status: text, -- 'pending', 'completed', 'cancelled'
  square_payment_id: text,
  created_at: timestamp
)

-- Order Items
order_items (
  id: uuid PRIMARY KEY,
  order_id: uuid REFERENCES orders(id),
  product_id: uuid REFERENCES products(id),
  quantity: integer,
  price_at_time: decimal
)
```

### Square API Integration

#### Payment Flow
1. **Cart Review** - User reviews items in Zustand cart
2. **Checkout Initiation** - Cart totals calculated
3. **Square Payment Form** - User enters payment details
4. **Payment Processing** - Square handles transaction
5. **Order Confirmation** - Success/failure handling

#### Implementation Pattern
```typescript
// Checkout flow
const checkout = async (cartItems: CartItem[]) => {
  // 1. Calculate totals from Zustand store
  const total = getTotalPrice()
  
  // 2. Create Square payment
  const paymentResult = await squarePayment.create({
    amount: total * 100, // Square uses cents
    currency: 'USD'
  })
  
  // 3. On success, save order to Supabase
  if (paymentResult.success) {
    await supabase.from('orders').insert({
      user_id: user.id,
      total_amount: total,
      square_payment_id: paymentResult.payment.id,
      status: 'completed'
    })
    
    // 4. Clear cart
    clearCart()
  }
}
```

## User Journey Flow

### Guest User
1. Browse products (from Supabase)
2. Add items to cart (Zustand)
3. Cart persists in localStorage
4. Must login to checkout

### Authenticated User
1. Login via Supabase Auth
2. Browse products (from Supabase)
3. Add items to cart (Zustand + user association)
4. Checkout with Square
5. Order saved to Supabase
6. View order history (from Supabase)

## Security Considerations

### Payment Security
- Square handles all PCI compliance
- No card data stored in our systems
- Payment processing server-side only

### Data Protection
- Supabase RLS (Row Level Security) for user data
- Environment variables for API keys
- HTTPS everywhere

### Cart Security
- Cart data non-sensitive (prices validated server-side)
- User association on checkout
- Order totals recalculated server-side

## Development Patterns

### State Management
- **Local UI State**: React useState/useReducer
- **Cart State**: Zustand (persisted)
- **Server State**: Supabase queries (consider React Query/SWR)
- **User Auth**: Supabase Auth context

### API Integration
- **Supabase**: Direct client SDK usage
- **Square**: Server-side API calls only
- **Payment Forms**: Square Web Payments SDK

### Error Handling
- Cart operations fail gracefully
- Payment failures handled with user feedback
- Network errors with retry mechanisms

## File Structure

```
/app
  /(auth)           # Authentication pages
  /api              # API routes (Square integration)
  /checkout         # Checkout flow pages
  /products         # Product listing/detail pages
  
/lib
  /store
    cart.ts         # Zustand cart store
  /supabase         # Supabase client configuration
  /square           # Square API utilities
  
/components
  /cart             # Cart-related components
  /checkout         # Checkout components
  /products         # Product components
  /ui               # shadcn/ui components

/docs
  ARCHITECTURE.md   # This file
```

## Environment Variables Required

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Square
SQUARE_APPLICATION_ID=
SQUARE_ACCESS_TOKEN=
SQUARE_LOCATION_ID=
NEXT_PUBLIC_SQUARE_APPLICATION_ID=
```

## Future Enhancements

### Phase 1 (Current)
- Basic cart functionality
- User authentication
- Simple checkout

### Phase 2
- Inventory management
- Order tracking
- Email notifications

### Phase 3
- Advanced analytics
- Subscription products
- Multi-location support

## Deployment Considerations

### Vercel Deployment
- Environment variables configured
- API routes for Square integration
- Static product images optimized

### Database Migrations
- Supabase migrations for schema changes
- Seed data for initial products

### Monitoring
- Error tracking (Sentry?)
- Performance monitoring
- Payment success/failure rates

---

*This architecture supports scalable e-commerce functionality while maintaining clean separation between cart management, user data, and payment processing.*