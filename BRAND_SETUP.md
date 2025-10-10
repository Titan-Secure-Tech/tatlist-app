# Tatlist Brand Setup Guide

This guide will help you complete the logo and brand color setup for your Tatlist application.

## 📋 Steps to Complete

### 1. Save Your Logo Image

Save your logo image (the one you shared in chat) as:

```
/Users/jbwashington/Developer/projects/tatlist-app/public/tatlist-logo.png
```

**Requirements:**

- Format: PNG (will be converted to WebP for optimization)
- Recommended width: 600-800px for good quality
- Transparent background preferred

### 2. Save Your App Icon

Save your app icon design as:

```
/Users/jbwashington/Developer/projects/tatlist-app/public/icon-source.png
```

**Requirements:**

- Format: PNG
- Size: At least 512x512px (square)
- Design should work well at small sizes (192px)
- Transparent or colored background as per your design

### 3. Run the Optimization Scripts

Once you've saved both images, run these commands:

```bash
# Optimize the logo for web use
./scripts/optimize-logo.sh

# Generate all PWA icon sizes
./scripts/generate-icons.sh
```

These scripts will:

- Resize and optimize your logo to reduce file size
- Generate all required icon sizes (192x192, 512x512, 180x180, etc.)
- Create favicon files

### 4. Update Brand Colors

Based on your brand color guide, update the following files:

#### A. Update `app/globals.css`

Replace the orange gradient and theme colors with your brand colors.

**Current colors:**

- Primary Orange: `#FFB347`
- Orange Gradient: `#FFB347` → `#FFA500` → `#FF8C00`

**Update these sections:**

- Lines 138-152: Custom orange gradient styles
- Lines 54-78: Root color variables (if needed)

#### B. Update `public/manifest.webmanifest`

Update the theme color (line 8):

```json
"theme_color": "#YOUR_BRAND_COLOR",
```

#### C. Update `app/layout.tsx`

Update the viewport theme color (line 75):

```typescript
themeColor: '#YOUR_BRAND_COLOR',
```

## 🎨 Brand Colors Reference

Based on your designer notes, document your brand colors here:

- **Primary:** #**\_\_\_**
- **Secondary:** #**\_\_\_**
- **Accent:** #**\_\_\_**
- **Background:** #**\_\_\_**
- **Text:** #**\_\_\_**

## ✅ Verification Checklist

After completing the setup:

- [ ] Logo displays correctly in the site header at `/`
- [ ] Logo displays correctly in email templates
- [ ] All PWA icons generated (check `public/` directory)
- [ ] App installs with correct icon on mobile devices
- [ ] Brand colors applied throughout the site
- [ ] Theme color matches in browser chrome (mobile)

## 🔧 Troubleshooting

**Logo not appearing?**

- Check file path: `public/tatlist-logo.webp`
- Clear Next.js cache: `rm -rf .next && bun dev`
- Check browser console for 404 errors

**Icons not generating?**

- Ensure source image is at least 512x512px
- Check file format is PNG
- Verify sips is available: `which sips`

**Colors not updating?**

- Clear browser cache
- Restart dev server: `bun dev`
- Check CSS variable names match

## 📝 Notes

- The logo component is at: `components/ui/logo.tsx`
- Email templates use: `lib/email/templates/BaseLayout.tsx`
- All icons are referenced in: `public/manifest.webmanifest`
