---
description: 
globs: *.tsx,*.ts
alwaysApply: false
---
# Supabase Client Creation

## Introduction

This rule defines the standard patterns for creating and using Supabase clients in both server and client components. We use the `@supabase/ssr` package which provides optimized clients for Next.js Server Components and Client Components.

## Pattern Description

There are two distinct patterns for creating Supabase clients:

1. Server-side client creation (for Server Components)
2. Client-side client creation (for Client Components)

### Server-Side Pattern

Use `createClient` from `@/lib/utils/supabase/server` in Server Components:

```typescript
import { createClient } from "@/lib/utils/supabase/server";

// In an async Server Component or route handler
const supabase = await createClient();
```

The server client:
- Automatically handles cookie management for auth
- Maintains user sessions
- Should be created within async functions
- Uses environment variables securely on the server

### Client-Side Pattern

Use `createClient` from `@/lib/utils/supabase/client` in Client Components:

```typescript
"use client";
import { createClient } from "@/lib/utils/supabase/client";

// In a Client Component
const supabase = createClient();
```

The client-side client:
- Uses only public environment variables
- Handles browser-specific auth flows
- Should be used with the "use client" directive
- Perfect for real-time subscriptions and client-side data fetching

## Implementation Steps

1. Import the appropriate client creator:
   - Server: `@/lib/utils/supabase/server`
   - Client: `@/lib/utils/supabase/client`

2. Create the client:
   - Server: `await createClient()`
   - Client: `createClient()`

3. Use type safety with the Database type:
   ```typescript
   import { Database } from "@/types/supabase";
   // Types are automatically included in both client creators
   ```

## Real-World Examples

* [Server Usage](mdc:lib/utils/supabase/server.ts)
* [Client Usage](mdc:lib/utils/supabase/client.ts)
* [Client Component Example](mdc:components/forms/photos-form.tsx)

## Common Pitfalls

* Using server client in Client Components
* Forgetting to await server client creation
* Creating multiple client instances unnecessarily (reuse when possible)
* Not using the typed client with your database schema
* Exposing sensitive environment variables to the client

## Security Considerations

* Never expose the service role key in client-side code
* Use Row Level Security (RLS) policies for data access control
* Validate user sessions on the server side
* Use environment variables appropriately:
  - `NEXT_PUBLIC_` prefix for client-side variables
  - Keep sensitive keys server-side only
