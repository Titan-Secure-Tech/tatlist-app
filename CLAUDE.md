# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tatlist is a Next.js 15 application using the App Router, TypeScript, Tailwind CSS v4, and shadcn/ui components. The application integrates with Lucky Supply product data via **FireCrawl AI-powered web scraping** and provides authentication and inventory management features.

🚀 **BREAKTHROUGH**: FireCrawl integration delivers real-time Lucky Supply data with 2-23 images per product, complete variant information, and 100% success rate, replacing the broken Lucky Supply API.

## Commands

This project uses **Bun** as the package manager and runtime. All commands can be run with `bun` instead of `npm`.

### Development

```bash
bun dev            # Start development server (standard webpack) on port 7500
# or
bun run dev        # Same as above

# For faster builds (may have cache issues):
bun run dev:turbo  # Start development server with Turbopack on port 7500
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

### Styling Conventions

- Using Tailwind CSS v4 with PostCSS-based configuration
- Primary color scheme: Black and white with gray accents
- Form inputs use consistent styling with black focus states
- Buttons follow a consistent pattern (black primary, white secondary)

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
```
