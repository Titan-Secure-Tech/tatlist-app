# Testing Guide

This project includes comprehensive testing infrastructure to ensure cart functionality stability and prevent regressions.

## Test Infrastructure

### Framework
- **Jest** - JavaScript testing framework
- **React Testing Library** - Component testing utilities
- **JSDOM** - Browser environment simulation

### Pre-commit Hooks
- **Husky** - Git hooks management
- **lint-staged** - Run tests on changed files
- Tests run automatically before every commit to catch issues early

## Running Tests

### Basic Commands
```bash
# Run all tests
bun test

# Run tests in watch mode (development)
bun run test:watch

# Run tests with coverage report
bun run test:coverage

# Run CI tests (no watch, with coverage)
bun run test:ci

# Run specific test pattern
bun test -- --testPathPatterns="CartIcon"
```

### Recommended Development Workflow
```bash
# Basic functionality test (always works)
bun test -- --testPathPatterns="cart-basic"

# Cart component tests
bun test -- --testPathPatterns="cart"

# Product component tests  
bun test -- --testPathPatterns="product"
```

## Test Coverage

### Cart System Components
- **CartIcon** - Badge display, accessibility, state updates
- **AddToCartButton** - Price conversion, quantity handling, toast notifications
- **ProductCard** - Image galleries, stock status, user interactions
- **ProductDetail** - Navigation, thumbnails, variants, accessibility
- **Cart Page** - Empty state, item management, checkout flow

### Integration Tests
- Complete cart workflow testing
- State consistency across components
- Price handling (dollars to cents conversion)
- Error handling and edge cases

### Test Utilities
Located in `__tests__/utils/test-utils.tsx`:
- Mock product data generators
- Cart state management helpers
- Custom render function with providers
- Mock implementations for external dependencies

## Mock Strategy

### External Dependencies
- **use-shopping-cart** - Mocked for isolated component testing
- **Next.js components** - Mocked Image and Link components
- **Supabase** - Mocked for database operations
- **Toast notifications** - Mocked for user feedback testing

### Test Data
- Consistent mock product data with realistic prices and images
- Various product states (in stock, out of stock, multiple images)
- Edge cases (missing data, zero prices, large quantities)

## Pre-commit Quality Gates

The following checks run automatically before each commit:

1. **ESLint** - Code quality and style enforcement
2. **Prettier** - Automatic code formatting
3. **Basic Tests** - Core functionality verification
4. **TypeScript** - Type checking (via lint)

## Best Practices

### Writing Tests
1. Use descriptive test names that explain the expected behavior
2. Test user interactions, not implementation details
3. Include accessibility testing (screen readers, keyboard navigation)
4. Test edge cases and error conditions
5. Mock external dependencies for isolation

### Test Organization
```
__tests__/
├── components/          # Component-specific tests
│   ├── cart/           # Cart system components
│   └── products/       # Product display components
├── pages/              # Page-level integration tests
├── integration/        # Cross-component workflow tests
└── utils/              # Test utilities and helpers
```

### Coverage Goals
- **Core cart functionality**: 100% coverage required
- **Component interactions**: All user flows tested
- **Edge cases**: Error states and boundary conditions
- **Accessibility**: Screen reader and keyboard support

## Troubleshooting

### Common Issues

**Tests failing due to missing mocks:**
```bash
# Check jest.setup.js for required mocks
# Add new mocks for external dependencies
```

**Pre-commit hooks failing:**
```bash
# Fix ESLint errors first
bun lint -- --fix

# Then run tests manually
bun test -- --testPathPatterns="cart-basic"
```

**Coverage reports missing:**
```bash
# Generate coverage report
bun run test:coverage

# View detailed HTML report
open coverage/lcov-report/index.html
```

### Development Tips

1. Start with basic tests when making changes
2. Use watch mode during development: `bun run test:watch`
3. Focus on testing user behavior, not implementation
4. Keep tests fast by mocking external dependencies
5. Update test data when adding new product features

## Continuous Integration

The test suite is designed to run in CI environments:

- Uses `--ci` flag for deterministic behavior
- Generates coverage reports
- Exits with appropriate status codes
- Handles timeout scenarios gracefully

Tests ensure the cart system remains stable and functional across all deployments.