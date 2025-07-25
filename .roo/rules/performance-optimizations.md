---
description: making react and nextjs more efficient and performant
globs: *.tsx, *.ts, *.mjs
---
- Wrap client components in Suspense with fallback. Use shadcn @skeleton.tsx component to create fallbacks that fit the UI
- Use dynamic loading for non-critical components.
- Optimize Web Vitals (LCP, CLS, FID).
- Favor server components and Next.js SSR.
- Use only for Web API access in small components.
- Avoid for data fetching or state management.
