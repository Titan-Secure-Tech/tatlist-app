# Testing Quick Start Guide

Quick reference for running tests in the Tatlist application.

## 🚀 Quick Commands

```bash
# Run all tests
bun test

# Run tests in watch mode (auto-rerun on file changes)
bun test:watch

# Run tests with coverage report
bun test:coverage

# Run tests with UI (interactive browser interface)
bun test:ui

# Run only unit tests
bun test __tests__/unit

# Run a specific test file
bun test cart-store

# Run tests for CI (with coverage)
bun test:ci
```

## 📋 Pre-Commit Hooks

Tests run automatically when you commit code:

```bash
git add .
git commit -m "Your commit message"
# → Husky runs lint-staged
# → ESLint fixes code
# → Prettier formats code
# → Vitest runs tests for changed files
# ✅ Commit proceeds if all pass
# ❌ Commit blocked if anything fails
```

### Emergency Bypass (use sparingly!)

```bash
git commit --no-verify -m "Emergency fix"
```

## ✅ What's Tested

### Unit Tests (`__tests__/unit/`)
- ✅ Cart store (Zustand) - 18 tests
- ✅ Utility functions (cn) - 8 tests
- ✅ Delivery configuration - 12+ tests
- ✅ Email service (Mailgun) - 12+ tests
- ✅ SMS service (Twilio) - 15+ tests
- ✅ Phone verification - 15+ tests

### Component Tests (`__tests__/components/`)
- ✅ Cart components
- ✅ Product components
- ✅ Auth components

### Integration Tests (`__tests__/integration/`)
- ✅ Authentication flow
- ✅ Cart workflow
- ✅ Category reorganization

### E2E Tests (`tests/e2e/`)
- ✅ Checkout flow
- ✅ Product import
- ✅ Production verification

## 🔍 Test Status

Run this to see current test status:

```bash
bun test --run
```

Expected output:
```
✓ __tests__/unit/lib/store/cart-store.test.ts (18)
✓ __tests__/unit/lib/utils/cn.test.ts (8)
✓ __tests__/unit/lib/config/delivery.test.ts (12)
✓ __tests__/unit/lib/email/mailgun.test.ts (12)
✓ __tests__/unit/lib/sms/twilio.test.ts (15)
✓ __tests__/unit/lib/verification/phone-verification.test.ts (15)

 Test Files  6 passed (6)
      Tests  80 passed (80)
```

## 🐛 Troubleshooting

### Tests fail locally

1. Clear test cache: `rm -rf node_modules/.vitest`
2. Reinstall dependencies: `bun install`
3. Run tests again: `bun test`

### Pre-commit hook not running

1. Reinstall Husky: `bun run prepare`
2. Check hook exists: `ls -la .husky/pre-commit`
3. Make it executable: `chmod +x .husky/pre-commit`

### Tests pass locally but fail in CI

- Check environment variables are set in CI
- Ensure all dependencies are installed
- Review CI logs for specific errors

## 📚 Learn More

For detailed testing documentation, see [TESTING.md](./TESTING.md)

## 💡 Best Practices

1. **Write tests for new features** - Always add tests for new code
2. **Test edge cases** - Don't just test happy paths
3. **Keep tests focused** - One test should test one thing
4. **Use descriptive names** - `it('should add item to cart when button is clicked')`
5. **Mock external services** - Don't call real APIs in tests
6. **Run tests before pushing** - `bun test` before `git push`

## 🎯 Coverage Goals

- Overall: 70%+
- Critical paths (cart, payment, auth): 90%+
- Utilities: 80%+

Check coverage:
```bash
bun test:coverage
# Then open: coverage/index.html
```

---

**Need help?** Check [TESTING.md](./TESTING.md) for detailed documentation.
