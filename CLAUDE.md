# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application using the App Router, TypeScript, Tailwind CSS v4, and shadcn/ui components. The project appears to be named "tatlist" and is set up with modern React 19.

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

### Key Directories
- `/app` - Next.js App Router pages and layouts
- `/lib` - Utility functions (includes `cn()` for className merging)
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

The project uses Tailwind CSS v4 with the new PostCSS-based configuration. When adding shadcn/ui components, they will be placed in the `/components/ui` directory and will use the `cn()` utility from `/lib/utils.ts` for className merging.

The application is currently a fresh Next.js installation with the default landing page intact.

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