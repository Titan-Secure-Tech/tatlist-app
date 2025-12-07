# Testing Documentation

This document provides comprehensive information about the testing infrastructure for the Tatlist application.

## Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Pre-Commit Hooks](#pre-commit-hooks)
- [CI/CD Integration](#cicd-integration)
- [Coverage](#coverage)
- [Troubleshooting](#troubleshooting)

## Overview

The Tatlist application uses a comprehensive testing strategy with the following tools:

- **Test Framework**: [Vitest](https://vitest.dev/) - Fast, modern test runner with native TypeScript support
- **Component Testing**: [@testing-library/react](https://testing-library.com/react) - React component testing utilities
- **Test Environment**: [happy-dom](https://github.com/capricorn86/happy-dom) - Lightweight DOM implementation
- **Mocking**: Vitest's built-in mocking capabilities
- **Pre-commit Hooks**: [Husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/okonet/lint-staged)

### Test Coverage

We have implemented tests for:

- ✅ **Unit Tests**
  - Cart store (Zustand)
  - Utility functions
  - Email service (Mailgun)
  - SMS service (Twilio)
  - Phone verification service
  - Delivery configuration

- ✅ **Component Tests**
  - Cart components
  - Product components
  - Authentication components

- ✅ **Integration Tests**
  - Authentication flow
  - Cart workflow
  - Checkout flow

- ✅ **E2E Tests**
  - Product import
  - Checkout flow
  - Production verification

## Test Structure

```
tatlist-app/
├── __tests__/
│   ├── unit/                    # Unit tests
│   │   ├── lib/
│   │   │   ├── store/          # Store tests
│   │   │   ├── utils/          # Utility tests
│   │   │   ├── email/          # Email service tests
│   │   │   ├── sms/            # SMS service tests
│   │   │   ├── verification/   # Verification service tests
│   │   │   └── config/         # Configuration tests
│   │   └── components/         # Component unit tests
│   ├── integration/            # Integration tests
│   │   ├── auth-access-control.test.tsx
│   │   ├── cart-workflow.test.tsx
│   │   └── category-reorganization.test.tsx
│   ├── components/             # Component tests
│   │   ├── cart/
│   │   ├── products/
│   │   └── pages/
│   └── e2e/                    # End-to-end tests
│       ├── checkout-flow.test.ts
│       └── production-verify.test.ts
├── vitest.config.ts            # Vitest configuration
├── vitest.setup.ts             # Test setup and mocks
└── .lintstagedrc.json          # Lint-staged configuration
```

## Running Tests

### All Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test:watch

# Run tests with UI
bun test:ui
```

### Specific Test Suites

```bash
# Run unit tests only
bun test __tests__/unit

# Run integration tests only
bun test __tests__/integration

# Run a specific test file
bun test __tests__/unit/lib/store/cart-store.test.ts

# Run tests matching a pattern
bun test cart
```

### Coverage

```bash
# Run tests with coverage report
bun test:coverage

# Run tests for CI with coverage
bun test:ci
```

### E2E Tests

```bash
# Run end-to-end tests
bun test:e2e

# Run production verification tests
bun test:production
```

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { myFunction } from '@/lib/utils'

describe('myFunction', () => {
  it('should return expected result', () => {
    const result = myFunction('input')
    expect(result).toBe('expected output')
  })
})
```

### Component Test Example

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MyComponent } from '@/components/MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Testing with Mocks

```typescript
import { describe, it, expect, vi } from 'vitest'

// Mock a module
vi.mock('@/lib/email/mailgun', () => ({
  MailgunService: vi.fn().mockImplementation(() => ({
    sendEmail: vi.fn().mockResolvedValue(true),
  })),
}))

describe('Email functionality', () => {
  it('should send email', async () => {
    const { MailgunService } = await import('@/lib/email/mailgun')
    const service = new MailgunService()
    const result = await service.sendEmail({ /* ... */ })
    expect(result).toBe(true)
  })
})
```

### Async Tests

```typescript
import { describe, it, expect } from 'vitest'

describe('Async operations', () => {
  it('should handle promises', async () => {
    const result = await fetchData()
    expect(result).toBeDefined()
  })

  it('should handle rejections', async () => {
    await expect(failingFunction()).rejects.toThrow('Error message')
  })
})
```

## Pre-Commit Hooks

The application uses Husky and lint-staged to run tests automatically before commits.

### Configuration

**`.lintstagedrc.json`**:
```json
{
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write",
    "vitest related --run --coverage=false"
  ],
  "*.{js,jsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md,mdx}": [
    "prettier --write"
  ]
}
```

### How It Works

1. When you run `git commit`, Husky triggers the pre-commit hook
2. lint-staged runs on staged files only:
   - **TypeScript files (.ts/.tsx)**: Runs ESLint, Prettier, and related tests
   - **JavaScript files (.js/.jsx)**: Runs ESLint and Prettier
   - **JSON/Markdown files**: Runs Prettier
3. Only if all checks pass, the commit proceeds
4. If any check fails, the commit is blocked

### Running Related Tests Only

The `vitest related --run --coverage=false` command:
- Runs ONLY tests related to the files you're committing
- Skips coverage collection for speed
- Prevents committing code that breaks existing tests

### Bypassing Pre-Commit Hooks (Emergency Only)

```bash
# Skip all pre-commit hooks (use with caution!)
git commit --no-verify -m "Emergency fix"
```

**⚠️ Warning**: Only bypass hooks when absolutely necessary (e.g., urgent production hotfix). You should still run tests manually afterward.

## CI/CD Integration

### GitHub Actions (Recommended)

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [master, main]
  pull_request:
    branches: [master, main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
      
      - name: Install dependencies
        run: bun install
      
      - name: Run tests
        run: bun test:ci
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

### Vercel Deployment

Add to `vercel.json`:

```json
{
  "buildCommand": "bun run build",
  "installCommand": "bun install",
  "devCommand": "bun dev",
  "ignoreCommand": "bun test:ci"
}
```

## Coverage

### Coverage Configuration

Coverage is configured in `vitest.config.ts`:

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  exclude: [
    'node_modules/',
    'tests/',
    '*.config.ts',
    '*.config.js',
    '.next/',
    'scripts/',
    'data/',
  ],
}
```

### Viewing Coverage Reports

After running `bun test:coverage`:

1. **Terminal**: Coverage summary is displayed in the terminal
2. **HTML Report**: Open `coverage/index.html` in your browser for detailed coverage

### Coverage Goals

- **Overall Coverage**: 70%+ target
- **Critical Functions**: 90%+ (cart, payment, auth)
- **Utility Functions**: 80%+

## Troubleshooting

### Common Issues

#### localStorage/sessionStorage Warnings

```
[zustand persist middleware] Unable to update item 'tatlist-cart'
```

**Solution**: This is expected in test environments. happy-dom doesn't fully implement storage APIs. Tests still pass correctly.

#### Mock Not Working

**Problem**: Mock is not being applied

**Solution**:
```typescript
// Make sure mocks are defined BEFORE imports
vi.mock('@/lib/myModule')

// Clear mocks between tests
beforeEach(() => {
  vi.clearAllMocks()
})
```

#### Tests Failing in CI But Passing Locally

**Problem**: Tests pass locally but fail in CI

**Common Causes**:
1. **Timezone differences**: Use `vi.setSystemTime()` for date tests
2. **Environment variables**: Ensure all required env vars are set in CI
3. **File paths**: Use path.resolve() for cross-platform compatibility

**Solution**:
```typescript
// Use explicit dates in tests
vi.setSystemTime(new Date('2025-12-06T10:00:00Z'))

// Clean up after tests
afterEach(() => {
  vi.useRealTimers()
})
```

#### Slow Tests

**Problem**: Tests are running slowly

**Solutions**:
- Use `vitest related` to run only affected tests
- Avoid unnecessary async operations
- Mock external services (Twilio, Mailgun, etc.)
- Use `vi.useFakeTimers()` instead of actual delays

```typescript
// Instead of:
await new Promise(resolve => setTimeout(resolve, 1000))

// Use:
vi.useFakeTimers()
vi.advanceTimersByTime(1000)
vi.useRealTimers()
```

### Getting Help

- **Vitest Docs**: https://vitest.dev/
- **Testing Library**: https://testing-library.com/
- **Project Issues**: Report bugs in the GitHub repository

## Best Practices

### DO ✅

- Write tests for all new features
- Test edge cases and error conditions
- Use descriptive test names
- Keep tests focused and independent
- Mock external dependencies
- Clean up after tests (timers, mocks, etc.)
- Use `beforeEach` to reset state between tests
- Test user behavior, not implementation details

### DON'T ❌

- Skip pre-commit hooks unless absolutely necessary
- Write tests that depend on execution order
- Test implementation details
- Mock everything (test real code when possible)
- Ignore failing tests
- Commit code without tests
- Use `any` types in test code
- Leave console.log statements in tests

## Examples

### Testing Form Validation

```typescript
describe('ContactForm', () => {
  it('should validate email format', async () => {
    const { user } = renderWithProviders(<ContactForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'invalid-email')
    
    const submitButton = screen.getByRole('button', { name: /submit/i })
    await user.click(submitButton)
    
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
  })
})
```

### Testing API Routes

```typescript
describe('POST /api/products', () => {
  it('should create a new product', async () => {
    const response = await POST(
      new Request('http://localhost/api/products', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Product',
          price: 1999,
        }),
      })
    )
    
    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data).toHaveProperty('id')
  })
})
```

### Testing with User Interactions

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('AddToCartButton', () => {
  it('should add item to cart on click', async () => {
    const user = userEvent.setup()
    render(<AddToCartButton product={mockProduct} />)
    
    const button = screen.getByRole('button', { name: /add to cart/i })
    await user.click(button)
    
    expect(screen.getByText(/added to cart/i)).toBeInTheDocument()
  })
})
```

## Continuous Improvement

This testing infrastructure is continuously evolving. Contributions to improve test coverage and quality are welcome!

### Future Enhancements

- [ ] Visual regression testing with Playwright
- [ ] Performance testing
- [ ] Accessibility testing automation
- [ ] Mutation testing with Stryker
- [ ] Contract testing for APIs
- [ ] Load testing for critical paths

---

**Last Updated**: December 6, 2025
**Maintained By**: Tatlist Development Team
