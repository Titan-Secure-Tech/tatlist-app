# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tatlist is a Next.js 15 application using the App Router, TypeScript, Tailwind CSS v4, and shadcn/ui components. The application integrates with Lucky Supply product data via **FireCrawl AI-powered web scraping** and provides authentication and inventory management features.

🚀 **BREAKTHROUGH**: FireCrawl integration delivers real-time Lucky Supply data with 2-23 images per product, complete variant information, and 100% success rate, replacing the broken Lucky Supply API.

## Commands

This project uses **Bun** as the package manager and runtime. All commands can be run with `bun` instead of `npm`.

### Development

```bash
bun dev            # Start development server with Turbopack on port 7500
# or
bun run dev        # Same as above (aligned with shadcn/ui v4 patterns)

# Formatting & Code Quality
bun run format:write  # Format all TypeScript, JavaScript, and MDX files
```

### Build & Production

```bash
bun build          # Build for production
bun start          # Start production server on port 7500
```

### Code Quality

```bash
bun lint           # Run ESLint
```

### Package Management

```bash
bun install        # Install dependencies
bun add <package>  # Add a new dependency
bun remove <package> # Remove a dependency
```

### Square Integration & Payment Processing

```bash
# Database Setup
bunx supabase db push --include-all  # Run Square integration migration

# Product Sync
bun run scripts/sync-square-products.ts  # Import Square catalog to Supabase

# Testing Square Integration
# 1. Visit /shop to see products
# 2. Add items to cart and checkout
# 3. Use test cards in sandbox:
#    - Success: 4111 1111 1111 1111
#    - Decline: 4000 0000 0000 0002
```

**Square Integration Status:**

- ✅ Database schema created and applied (orders, payments, webhooks tables)
- ✅ Test products created and working
- ✅ Checkout flow with order creation in database
- ✅ Payment processing route with order tracking
- ✅ Webhook handler for payment confirmations
- ✅ Enhanced payment success page with order details
- ✅ Apple Pay domain verification configured and working
- ⚠️ Square product sync requires OAuth scope permissions (ITEMS_READ/WRITE)

**Apple Pay Configuration:**

- ✅ Verification file accessible at: `https://tatlist.com/.well-known/apple-developer-merchantid-domain-association`
- ✅ File served correctly via Next.js public directory
- ✅ Ready for Square domain verification in production

**Integration Test Results (Local):**

- ✅ Products API returns 4 test products
- ✅ Checkout API creates orders in database
- ✅ Apple Pay verification file loads correctly
- ✅ Payment success page shows order details
- ✅ Mock payment flow works end-to-end

**Required Environment Variables for Square:**

```bash
# Square Sandbox
SQUARE_SANDBOX_ACCESS_TOKEN=your_token
SQUARE_SANDBOX_APPLICATION_ID=your_app_id
SQUARE_SANDBOX_LOCATION_ID=your_location_id

# Square Production (when ready)
SQUARE_PRODUCTION_ACCESS_TOKEN=your_token
SQUARE_PRODUCTION_APPLICATION_ID=your_app_id
SQUARE_PRODUCTION_LOCATION_ID=your_location_id

# Webhook Signature (production only)
SQUARE_WEBHOOK_SIGNATURE_KEY=your_webhook_key
```

### Delivery Zone Validation & Business Verification

**Features:**

- ✅ Mapbox integration for address validation and geocoding
- ✅ Delivery zone radius check (25 miles from Tampa center)
- ✅ Business details form with real-time address validation
- ✅ License number verification for tattoo shops
- ✅ Distance-based delivery fee calculation
- ✅ Database storage of validated business details

**Checkout Flow:**

1. Customer enters business details and tattoo shop license number
2. Address is validated via Mapbox geocoding API
3. System checks if location is within 25-mile delivery radius
4. If valid, customer proceeds to payment with Square
5. Business details stored in database for future orders

**Required Environment Variables:**

```bash
# Mapbox Configuration
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
```

**Testing the Checkout:**

- Visit `/shop/checkout-v2` for the enhanced checkout with business validation
- Original checkout remains at `/shop/checkout` for fallback

### Geolocation Alerts & Real-Time Delivery Notifications

**Features:**

- ✅ Real-time proximity alerts ("Driver is 10 minutes away", "Driver is arriving now")
- ✅ Distance-based alerts (2 miles, 1 mile, 0.5 miles away)
- ✅ ETA-based alerts (10 minutes, 5 minutes, arriving now)
- ✅ Multi-channel notifications (Email + SMS via Twilio)
- ✅ Customer notification preferences management
- ✅ Quiet hours support to avoid disturbing customers
- ✅ Alert deduplication to prevent spam
- ✅ Admin dashboard for configuring alert thresholds
- ✅ Automated monitoring via cron job (runs every minute)

**Alert Types:**

1. **ETA Alerts**: Triggered when estimated arrival time reaches threshold
   - 10 minutes away
   - 5 minutes away
   - Arriving now (< 2 minutes)

2. **Distance Alerts**: Triggered when driver distance reaches threshold
   - 2 miles away
   - 1 mile away
   - 0.5 miles away

**System Architecture:**

- **Monitoring Service** (`/lib/alerts/monitoring-service.ts`): Tracks active deliveries and calculates distances/ETAs
- **Notification Service** (`/lib/alerts/notification-service.ts`): Sends alerts via email/SMS based on preferences
- **Email Service** (`/lib/email/mailgun.ts`): Sends email notifications using Mailgun
- **SMS Service** (`/lib/sms/twilio.ts`): Sends SMS notifications using Twilio
- **Cron Job** (`/api/alerts/monitor`): Runs every minute to check deliveries and trigger alerts
- **Admin Interface** (`/admin/alerts`): Configure alert thresholds and view statistics
- **Customer Preferences** (`/customer/settings/notifications`): Manage notification preferences

**Phone Verification:**

✅ **Phone Verification System Implemented** - Customers can now verify their phone numbers to receive SMS notifications:

- **SMS Verification Codes**: 6-digit codes sent via Twilio
- **Security Features**: Rate limiting (3 requests/min), code expiry (10 min), attempt limiting (3 attempts)
- **User Experience**: Countdown timer, resend functionality, clear error messages
- **API Routes**:
  - `POST /api/verification/send-code` - Sends verification code
  - `POST /api/verification/verify-code` - Verifies code and updates database
- **Service**: `PhoneVerificationService` (`/lib/verification/phone-verification.ts`)
- **Documentation**: See `/lib/verification/README.md` for detailed documentation

**Required Environment Variables:**

```bash
# Twilio Configuration (SMS Notifications & Phone Verification)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number  # Format: +1XXXXXXXXXX

# Mailgun Configuration (Email Notifications)
MAILGUN_BASE_URL=https://api.mailgun.net
MAILGUN_DOMAIN=your_domain.com
MAILGUN_SENDING_KEY=your_private_api_key

# Cron Job Security
CRON_SECRET=your_random_secret_key  # Used to authenticate cron job requests
```

**Database Tables:**

- `alert_thresholds`: Configurable rules for triggering alerts
- `geolocation_alerts`: Log of all alerts sent to customers
- `customer_notification_preferences`: User preferences for notifications

**Testing the Alert System:**

1. **Admin Configuration**:
   - Visit `/admin/alerts` to view alert thresholds and statistics
   - Enable/disable specific alert types
   - Configure notification channels (email, SMS, or both)

2. **Customer Preferences**:
   - Visit `/customer/settings/notifications` to manage preferences
   - Set notification channels and quiet hours
   - Add phone number for SMS alerts

3. **Trigger Alerts Manually**:

   ```bash
   # Development only - trigger monitoring manually
   curl http://localhost:7500/api/alerts/monitor
   ```

4. **Cron Job** (Production):
   - Vercel cron job runs every minute automatically
   - Monitors all `in_progress` deliveries
   - Triggers alerts when thresholds are met

**Alert Flow:**

1. Driver updates location during delivery
2. Cron job runs every minute and checks active deliveries
3. System calculates distance and ETA from driver to destination
4. If threshold is met and alert hasn't been sent recently:
   - Check customer preferences and quiet hours
   - Send notification via preferred channel(s)
   - Log alert to database
5. Customer receives email and/or SMS notification

**Migration:**

```bash
# Apply geolocation alerts migration
bunx supabase db push --include-all

# Migration file: supabase/migrations/20251110070000_add_geolocation_alerts.sql
```

### Supabase Development & Management

```bash
# Local Development
bunx supabase start  # Start local Supabase instance
bunx supabase stop   # Stop local Supabase instance
bunx supabase status # Show status of local containers

# Database Management
bunx supabase db reset              # Reset local database
bunx supabase db push               # Push local migrations to remote
bunx supabase db pull               # Pull remote schema to local
bunx supabase migration new <name>  # Create new migration

# Configuration Management
bunx supabase config push --project-ref <project-id>  # Push config to production
bunx supabase config diff --project-ref <project-id>  # Show config differences
bunx supabase link --project-ref <project-id>         # Link to remote project

# Production Management
bunx supabase secrets set <key> <value> --project-ref <project-id>  # Set production secrets
bunx supabase projects list                                          # List all projects
```

**Supabase Custom Domain Configuration:**

✅ **Custom Domain Configured**: `db.tatlist.com`

The following configuration has been completed:

1. **Supabase API Custom Domain**:
   - Custom domain: `db.tatlist.com`
   - Configured in Supabase Dashboard and DNS

2. **Site URL Configuration** (Supabase Auth Settings):
   - Site URL: `https://tatlist.com`
   - Update at: https://supabase.com/dashboard/project/yzpiadsnllrycdfxlneb/auth/url-configuration

3. **Auth Redirect URLs**:
   - `https://tatlist.com/api/auth/callback`
   - `https://tatlist.com/*` (wildcard for all paths)

4. **Environment Variables**:
   - Production Supabase URL: `https://db.tatlist.com`
   - Site URL: `https://tatlist.com`

   Update these in Vercel:

   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL production
   # Enter: https://db.tatlist.com

   vercel env add NEXT_PUBLIC_SITE_URL production
   # Enter: https://tatlist.com
   ```

### Vercel Deployment & Management

```bash
# Authentication
vercel login                    # Login to Vercel
vercel logout                   # Logout from Vercel

# Deployment
vercel                         # Deploy to preview environment
vercel --prod                  # Deploy to production
vercel build                   # Build project locally

# Environment Variables
vercel env pull .env.local --environment production   # Pull production env vars
vercel env pull .env.local --environment preview      # Pull preview env vars
vercel env add                                         # Add new environment variable
vercel env ls                                          # List environment variables
vercel env rm <name>                                   # Remove environment variable

# Project Management
vercel projects ls             # List all projects
vercel domains ls              # List custom domains
vercel logs                    # View deployment logs
vercel inspect <url>           # Inspect deployment details

# Aliases & URLs
vercel alias                   # Manage domain aliases
vercel alias set <deployment-url> <domain>  # Set custom domain alias
```

### Lucky Supply Data Management (FireCrawl)

```bash
# Scrape all Lucky Supply products (128 products, ~30 mins)
bun run scripts/scrape-lucky-supply-reliable.ts

# Import scraped data to database (replaces CSV)
bun run scripts/import-firecrawl-to-supabase.ts --import

# Preview scraped data before import
bun run scripts/import-firecrawl-to-supabase.ts --preview

# Legacy: Manual product ID scraping
bun run scripts/scrape-lucky-ids-simple.ts
```

### Project-Specific Configuration

This project is configured with the following remote services:

**Supabase Project**:

- Project ID: `yzpiadsnllrycdfxlneb`
- Use `--project-ref yzpiadsnllrycdfxlneb` for Supabase CLI commands

**Vercel Project**:

- Project: `tatlist`
- Organization: `titan-tech-9d2bd055`
- Production URL: `https://tatlist.vercel.app`

## Architecture & Structure

### Tech Stack

- **Framework**: Next.js 15.3.3 with App Router and Turbopack
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 with CSS variables
- **UI Components**: shadcn/ui (configured in components.json)
- **Font**: Geist Sans and Geist Mono
- **Icons**: Lucide React
- **Authentication**: Supabase Auth with OAuth (Google) and email/password
- **Database**: Supabase (PostgreSQL)
- **Product Data**: FireCrawl AI-powered web scraping from Lucky Supply
- **State Management**: Zustand for client-side state (cart functionality)

### Key Directories

- `/app` - Next.js App Router pages and layouts
  - `/app/(auth)` - Authentication pages (login, register)
  - `/app/api/auth` - Auth API routes including OAuth callback
- `/lib` - Utility functions and integrations
  - `/lib/supabase` - Supabase client configurations (server/client/middleware)
  - `/lib/store` - Zustand stores (cart state management)
  - `/lib/utils.ts` - Utility functions including `cn()` for className merging
- `/public` - Static assets including CSV data files
- `/components` - React components (shadcn/ui components go to `/components/ui`)

### Important Configuration

- **TypeScript**: Strict mode enabled, using path aliases (`@/*`)
- **Tailwind**: v4 with PostCSS, configured for CSS variables
- **ESLint**: Next.js Core Web Vitals and TypeScript rules
- **shadcn/ui**: New York style, RSC enabled, using Lucide icons

### Path Aliases

- `@/*` maps to the root directory
- `@/components` for components
- `@/lib` for utilities
- `@/hooks` for custom hooks

### Data Files

The project includes Shopify product data in CSV format located at:

- `/public/assets/shopify_formatted_products.csv`
- `/public/assets/shopify_formatted_products_cleaned.csv`

## Development Notes

### Authentication Flow

- Supabase handles authentication with support for email/password and OAuth providers (Google)
- Authentication state is managed server-side with session cookies
- Protected routes are handled via middleware that refreshes sessions
- OAuth callback route at `/api/auth/callback` handles the OAuth flow

### Database Integration

- Using Supabase as the backend (PostgreSQL database)
- Server components use `createClient` from `/lib/supabase/server.ts`
- Client components use `createClient` from `/lib/supabase/client.ts`
- Middleware refreshes sessions automatically on each request

### Email System

**Transactional Emails with React Email:**

All email templates are built using [React Email](https://react.email) with a consistent design system matching the platform's black and white aesthetic.

**Available Templates:**

- **Order Confirmation** - Sent after successful order placement
- **Order Status Updates** - Dynamic status notifications (preparing, ready, out_for_delivery, delivered, cancelled)
- **Contact Form** - Customer inquiry notifications

**Preview Templates Locally:**

```bash
# Preview order confirmation
http://localhost:7500/api/email/preview?template=order-confirmation

# Preview order status (with status parameter)
http://localhost:7500/api/email/preview?template=order-status&status=delivered

# Preview contact form
http://localhost:7500/api/email/preview?template=contact-form
```

**Test Email Delivery:**

```bash
# Test order confirmation email
curl "http://localhost:7500/api/test-email?email=your@email.com&type=confirmation"

# Test status update email
curl "http://localhost:7500/api/test-email?email=your@email.com&type=status&status=delivered"
```

**Email Service Configuration:**

The Mailgun service (`lib/email/mailgun.ts`) handles all email sending. Templates are located in `lib/email/templates/`. See `lib/email/README.md` for detailed documentation.

**Required Environment Variables:**

```bash
MAILGUN_BASE_URL=https://api.mailgun.net
MAILGUN_DOMAIN=your-domain.com
MAILGUN_SENDING_KEY=your-private-api-key
```

### Styling Conventions

- Using Tailwind CSS v4 with PostCSS-based configuration
- Primary color scheme: Black and white with gray accents
- Form inputs use consistent styling with black focus states
- Buttons follow a consistent pattern (black primary, white secondary)
- Email templates follow the same black/white design system

## Port Configuration

This project uses custom ports to avoid conflicts with other local development environments:

- **Next.js Development Server**: Port 7500
- **Supabase Services** (when running locally):
  - API Gateway (Kong): Port 9521
  - Database (PostgreSQL): Port 9522
  - Studio: Port 9523
  - Inbucket (Email Testing): Port 9524
  - Analytics: Port 9527

Environment variables are configured in `.env.local` (not committed to git).

### Required Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Site URL (for OAuth callbacks)
NEXT_PUBLIC_SITE_URL=http://localhost:7500  # Development

# Web Push Notifications (VAPID Keys)
# Generate your own keys with: bunx web-push generate-vapid-keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:support@tatlist.com
```
