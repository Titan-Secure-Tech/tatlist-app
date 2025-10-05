# Tatlist Slash Commands

Quick, powerful commands to streamline your development workflow.

## Quick Start

```bash
# See all available commands
bun slash help

# Or use directly
bun /dev          # Start dev server
bun /fix          # Auto-fix issues
bun /db-status    # Check database
```

## Available Commands

### 🚀 `/dev` - Smart Dev Server

Intelligently manages your development server:

- Kills any existing servers on port 7500
- Starts fresh with Turbopack
- Handles graceful shutdown

```bash
bun /dev
# or
bun slash dev
```

### 🚢 `/deploy` - Safe Deployment

Complete deployment pipeline with safety checks:

- Runs build check locally first
- Type checks your code
- Verifies environment variables
- Deploys to preview or production

```bash
bun /deploy
# Choose preview or production when prompted
```

### 💳 `/square-test` - Payment Testing

End-to-end Square integration testing:

- Tests API connection
- Verifies product catalog
- Creates test orders
- Processes test payments
- Checks webhook endpoints

```bash
bun /square-test
```

### 🗄️ `/db-status` - Database Health

Quick database health check:

- Connection status
- Table statistics
- Recent orders
- Migration status
- Auth configuration

```bash
bun /db-status
```

### 🔧 `/fix` - Auto-Fixer

Automatically fixes common issues:

- TypeScript errors
- Code formatting (Prettier)
- ESLint issues
- Dependency updates
- Cache clearing
- File permissions

```bash
bun /fix
```

## Usage Patterns

### Direct execution (recommended)

```bash
bun /dev
bun /deploy
bun /fix
```

### Via slash runner

```bash
bun slash dev
bun slash deploy
bun slash fix
```

### From npm scripts

```bash
npm run /dev
npm run /deploy
npm run /fix
```

## Common Workflows

### Starting fresh development

```bash
bun /fix      # Fix any issues first
bun /dev      # Start clean dev server
```

### Before deploying

```bash
bun /fix              # Ensure everything is clean
bun /square-test      # Verify payments work
bun /db-status        # Check database health
bun /deploy           # Deploy with confidence
```

### Debugging issues

```bash
bun /db-status    # Check database connection
bun /fix          # Try auto-fixing
bun /dev          # Restart dev server
```

## Environment Requirements

Make sure these are configured in `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Square (for payment testing)
SQUARE_SANDBOX_ACCESS_TOKEN=your-token
SQUARE_SANDBOX_APPLICATION_ID=your-app-id
SQUARE_SANDBOX_LOCATION_ID=your-location-id

# Mapbox (for address validation)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your-token
```

## Adding New Commands

1. Create a new TypeScript file in `slash-commands/`:

```typescript
// slash-commands/my-command.ts
#!/usr/bin/env bun

import chalk from 'chalk';

async function main() {
  console.log(chalk.bold.blue('My Command'));
  // Your command logic here
}

main().catch(console.error);
```

2. Add to the registry in `slash-commands/index.ts`:

```typescript
const commands = {
  'my-command': {
    description: 'Description of your command',
    file: 'my-command.ts',
  },
  // ...
}
```

3. Add to `package.json`:

```json
{
  "scripts": {
    "/my-command": "bun slash-commands/my-command.ts"
  }
}
```

4. Make executable and test:

```bash
chmod +x slash-commands/my-command.ts
bun /my-command
```

## Tips

- Commands are designed to be idempotent - safe to run multiple times
- Most commands provide colored output for better readability
- Use `VERBOSE=1` environment variable for more detailed output
- All commands handle errors gracefully and provide helpful messages
