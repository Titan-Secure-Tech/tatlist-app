# Progressive Web App (PWA) Implementation

This document describes the native PWA implementation for Tatlist using Next.js 15 and TypeScript, without external libraries.

## Overview

Tatlist is a fully installable Progressive Web App that works offline and provides an app-like experience on all platforms. The implementation uses Next.js 15's native PWA features combined with a TypeScript service worker that compiles to JavaScript during the build process.

## Architecture

### Key Files

```
tatlist-app/
├── app/
│   ├── manifest.ts              # App manifest (native Next.js)
│   ├── sw.ts                    # TypeScript service worker source
│   ├── offline/
│   │   └── page.tsx            # Offline fallback page
│   └── layout.tsx              # Root layout with PWA metadata
├── components/
│   └── PWAInstaller.tsx        # Install prompt component
├── public/
│   ├── sw.js                   # Compiled service worker (auto-generated)
│   ├── icon-192x192.png        # PWA icon
│   ├── icon-512x512.png        # PWA icon
│   └── ...
└── scripts/
    └── build-sw.ts             # Service worker build script
```

## Features

### 1. App Manifest (`app/manifest.ts`)

Uses Next.js 15's native `MetadataRoute.Manifest` type for type-safe manifest configuration.

**Key Configuration:**

- **Name**: "Tatlist - Tampa Tattoo Supply"
- **Short Name**: "Tatlist"
- **Display Mode**: `standalone` (full-screen app experience)
- **Theme Color**: `#FFB347` (brand orange)
- **Background Color**: `#ffffff`
- **Icons**: 4 variants (192x192, 512x512, regular and orange versions)
- **Categories**: `['business', 'shopping']`

### 2. TypeScript Service Worker (`app/sw.ts`)

A fully typed service worker that provides:

**Caching Strategy:**

- **Static Assets**: Cache-first (HTML, CSS, JS, images, fonts)
- **API Calls**: Network-first with cache fallback
- **Dynamic Content**: Network-first with cache fallback
- **Offline Fallback**: Shows `/offline` page when network unavailable

**Cache Names:**

- `tatlist-static-v1`: Static assets
- `tatlist-dynamic-v1`: Dynamic content and API responses

**TypeScript Features:**

- `/// <reference lib="webworker" />` for Web Worker types
- Typed event handlers (`ExtendableEvent`, `FetchEvent`, `PushEvent`, `NotificationEvent`)
- `ServiceWorkerGlobalScope` declaration
- Full IntelliSense support

**Additional Capabilities:**

- Push notifications (ready for future implementation)
- Notification click handling
- Automatic cache cleanup on activation

### 3. Service Worker Compilation

Since browsers cannot execute TypeScript directly, we compile `app/sw.ts` → `public/sw.js`.

**Build Script** (`scripts/build-sw.ts`):

```typescript
import { Bun.Transpiler } from 'bun'

const transpiler = new Bun.Transpiler({
  loader: 'ts',
  target: 'browser',
})

// Transpiles app/sw.ts to public/sw.js
```

**Automatic Compilation:**

- Runs before every `bun dev`
- Runs before every `bun build`
- Uses Bun's built-in TypeScript transpiler (zero dependencies)

**package.json scripts:**

```json
{
  "dev": "bun run build:sw && next dev -p 7500",
  "build": "bun run build:sw && next build",
  "build:sw": "bun run scripts/build-sw.ts"
}
```

### 4. Install Prompt Component (`components/PWAInstaller.tsx`)

A smart install prompt that adapts to different platforms:

**Features:**

- Detects `beforeinstallprompt` event (Android/Chrome/Edge)
- iOS-specific instructions with share button icon
- Shows automatically 3 seconds after page load
- Dismissible with localStorage tracking (7-day cooldown)
- Checks if app is already installed
- Uses shadcn/ui Button component for consistent styling

**Platform Detection:**

- **Android/Desktop**: Native install button with browser prompt
- **iOS**: Instructions to use "Add to Home Screen"
- **Already Installed**: Component hidden

### 5. Offline Page (`app/offline/page.tsx`)

User-friendly offline fallback page featuring:

- `WifiOff` icon from lucide-react
- "Try Again" button to reload
- Responsive design matching app theme
- Minimal, clean interface

### 6. PWA Metadata (`app/layout.tsx`)

Enhanced metadata for PWA support:

```typescript
export const metadata: Metadata = {
  applicationName: 'Tatlist - Tampa Tattoo Supply',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Tatlist',
  },
  manifest: '/manifest.webmanifest',
  // ... other metadata
}

export const viewport: Viewport = {
  themeColor: '#FFB347',
  // ... other viewport settings
}
```

## Installation & Setup

### Prerequisites

- Bun runtime (for TypeScript transpilation)
- Next.js 15.6.0-canary.38 or later
- Icons in public directory (192x192, 512x512)

### Development

```bash
# Start dev server (automatically compiles service worker)
bun dev

# Or with Turbopack
bun dev --turbo
```

### Production Build

```bash
# Build for production (automatically compiles service worker)
bun build

# Start production server
bun start
```

### Manual Service Worker Compilation

```bash
# Compile service worker manually
bun run build:sw
```

## Testing

### Local Testing

1. Start the dev server: `bun dev --turbo`
2. Open http://localhost:7500
3. Open DevTools → Application → Service Workers
4. Verify service worker is registered
5. Check manifest in Application → Manifest

### Install Testing

**Desktop (Chrome/Edge):**

1. Look for install button in address bar
2. Or wait 3 seconds for install prompt
3. Click "Install" to add to desktop

**Android:**

1. Open in Chrome
2. Wait for install banner or use menu → "Add to Home screen"
3. Icon appears on home screen

**iOS (Safari):**

1. Tap share button
2. Select "Add to Home Screen"
3. Follow on-screen instructions

### Offline Testing

1. Install the PWA
2. Open DevTools → Network
3. Check "Offline" checkbox
4. Reload the app
5. Verify offline page appears or cached content loads

## Customization

### Adding New Static Assets

Edit `app/sw.ts`:

```typescript
const STATIC_ASSETS: string[] = [
  '/',
  '/offline',
  '/your-new-page', // Add new pages
  '/logo.webp',
  // ... other assets
]
```

Then rebuild: `bun run build:sw`

### Changing Cache Strategy

Edit the fetch event handler in `app/sw.ts`:

```typescript
self.addEventListener('fetch', (event: FetchEvent) => {
  // Customize caching logic here
})
```

### Updating App Icons

1. Replace icons in `/public`:
   - `icon-192x192.png`
   - `icon-512x512.png`
   - `android-chrome-192x192.png`
   - `android-chrome-512x512.png`

2. Update `app/manifest.ts` if adding new icon sizes

### Modifying Theme Colors

Update in two places:

1. **Manifest** (`app/manifest.ts`):

```typescript
theme_color: '#FFB347',
background_color: '#ffffff',
```

2. **Viewport** (`app/layout.tsx`):

```typescript
export const viewport: Viewport = {
  themeColor: '#FFB347',
}
```

## Troubleshooting

### Service Worker Not Registering

1. Check browser console for errors
2. Verify `public/sw.js` exists
3. Run `bun run build:sw` manually
4. Clear browser cache and reload

### Install Prompt Not Showing

1. PWA must be served over HTTPS (or localhost)
2. Manifest must be valid
3. Service worker must be registered
4. User must not have dismissed prompt recently
5. Check localStorage for `pwa-install-dismissed`

### Offline Mode Not Working

1. Check Service Worker is active (DevTools → Application)
2. Verify static assets are cached
3. Check cache names match in service worker
4. Clear all caches and reload

### TypeScript Errors in Service Worker

1. Ensure `/// <reference lib="webworker" />` is at the top of `app/sw.ts`
2. Check tsconfig.json includes webworker lib
3. Run type check: `bun run type-check`

## Browser Support

| Feature            | Chrome | Edge | Safari     | Firefox   |
| ------------------ | ------ | ---- | ---------- | --------- |
| Service Worker     | ✅     | ✅   | ✅         | ✅        |
| Install Prompt     | ✅     | ✅   | ⚠️ Manual  | ⚠️ Manual |
| Offline            | ✅     | ✅   | ✅         | ✅        |
| Push Notifications | ✅     | ✅   | ✅ (16.4+) | ✅        |

⚠️ = Feature works but requires manual installation

## Best Practices

### Performance

- Keep service worker file small (currently ~5KB compiled)
- Cache only essential static assets initially
- Use dynamic caching for user-specific content
- Version cache names when updating

### Security

- Always serve PWA over HTTPS in production
- Validate cached responses before serving
- Implement proper CORS for external resources
- Keep service worker logic simple and auditable

### User Experience

- Don't show install prompt too frequently
- Provide clear offline messaging
- Cache critical navigation routes
- Test on actual devices, not just emulators

### Maintenance

- Update cache version when deploying new features
- Clean up old caches in activate event
- Monitor service worker errors in production
- Keep TypeScript types up to date

## Future Enhancements

### Planned Features

- [ ] Push notification implementation
- [ ] Background sync for offline actions
- [ ] Periodic background sync for fresh data
- [ ] Share API integration
- [ ] Shortcuts in manifest
- [ ] Screenshots for app stores

### Optimization Opportunities

- [ ] Workbox-style caching strategies
- [ ] IndexedDB for structured data caching
- [ ] Precaching with build-time asset lists
- [ ] Service worker hot reload in development
- [ ] Web app install analytics

## Resources

- [Next.js PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps)
- [MDN Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web.dev PWA](https://web.dev/progressive-web-apps/)
- [PWA Builder](https://www.pwabuilder.com/)

## License

This PWA implementation is part of the Tatlist project.

---

**Last Updated**: October 1, 2025
**Branch**: `feature/native-pwa-implementation`
**Author**: Tatlist Development Team
