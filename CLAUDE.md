# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tatlist is a Next.js 15 application using the App Router, TypeScript, Tailwind CSS v4, and shadcn/ui components. The application integrates with Lucky Supply product data and provides authentication and inventory management features.

## Commands

This project uses **Bun** as the package manager and runtime. All commands can be run with `bun` instead of `npm`.

### Development
```bash
bun dev            # Start development server with Turbopack on port 7500
# or
bun run dev        # Same as above
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

### Supabase Local Development
```bash
bunx supabase start  # Start local Supabase instance
bunx supabase stop   # Stop local Supabase instance
```

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