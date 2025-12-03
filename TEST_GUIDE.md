# Testing Guide

## Overview

The Stanford Prompt Library uses **Vitest** for unit testing with a focus on testing core service layer and state management logic.

## Test Coverage

```
Overall Coverage: 64.75% statements | 58.77% branches | 56.6% functions
```

### What We Test

✅ **BaseService** (25 tests)
- Custom error classes (DatabaseError, ServiceError, ValidationError, AuthenticationError)
- Query execution with Supabase response handling
- Caching with TTL and expiration
- Pattern-based cache invalidation
- Metrics tracking (hits, misses, requests, errors)
- Cache size management

✅ **Store** (43 tests)
- State getting/setting with nested paths
- Change tracking and history
- Subscription patterns (wildcard, multi-key, nested)
- Middleware execution
- Unsubscribe functionality
- Integration tests for complex patterns

### What We Don't Test

❌ UI Components (too brittle, low ROI)
❌ Third-party libraries (Supabase, etc.)
❌ Simple getters/setters
❌ Configuration files

## Running Tests

### Quick Commands

```bash
# Run all tests
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Output

Passing tests show ✓:
```
✓ tests/services/base-service.test.js (25 tests) 43ms
✓ tests/state/store.test.js (43 tests) 18ms

Test Files  2 passed (2)
Tests  68 passed (68)
```

### Coverage Thresholds

Configured in `vitest.config.js`:
- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 75%
- **Statements**: 80%

## Test Structure

```
app/tests/
├── setup.js              # Global test setup, Supabase mocks
├── services/
│   └── base-service.test.js  # BaseService tests (25 tests)
└── state/
    └── store.test.js     # Store tests (43 tests)
```

## Writing Tests

### Test File Template

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('MyService', () => {
  let service

  beforeEach(() => {
    service = new MyService()
    vi.clearAllMocks()
  })

  describe('methodName', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test'

      // Act
      const result = service.methodName(input)

      // Assert
      expect(result).toBe('expected')
    })
  })
})
```

### Mocking Supabase

Global Supabase mocks are set up in `tests/setup.js`:

```javascript
export const mockSupabaseClient = {
  from: vi.fn(() => mockSupabaseClient),
  select: vi.fn(() => mockSupabaseClient),
  insert: vi.fn(() => mockSupabaseClient),
  // ... etc
}

vi.mock('../src/config/supabase.js', () => ({
  supabase: mockSupabaseClient,
}))
```

### Testing Best Practices

#### ✅ DO

- Use descriptive test names: `it('should cache results with valid TTL')`
- Test one thing per test
- Use `beforeEach` to set up clean state
- Mock external dependencies (Supabase)
- Test error cases
- Use `expect` assertions liberally

#### ❌ DON'T

- Test implementation details
- Share state between tests
- Test multiple scenarios in one test
- Make real API calls
- Skip cleanup (`vi.clearAllMocks()`)

## Example Tests

### Testing BaseService Caching

```javascript
it('should cache results with valid TTL', async () => {
  const mockData = { id: 1, name: 'Cached' }
  const queryFn = vi.fn(() => Promise.resolve({ data: mockData, error: null }))

  // First call - cache miss
  const result1 = await service.getCached('cache-key', queryFn, 5000)
  expect(queryFn).toHaveBeenCalledTimes(1)
  expect(result1).toEqual(mockData)

  // Second call - cache hit
  const result2 = await service.getCached('cache-key', queryFn, 5000)
  expect(queryFn).toHaveBeenCalledTimes(1) // Not called again
  expect(result2).toEqual(mockData)
})
```

### Testing Store Subscriptions

```javascript
it('should call callback when subscribed key changes', () => {
  const callback = vi.fn()
  store.subscribe('count', callback)

  store.setState({ count: 5 }, 'test')

  expect(callback).toHaveBeenCalledTimes(1)
  expect(callback).toHaveBeenCalledWith(
    expect.objectContaining({ count: 5 }),
    expect.objectContaining({ count: 0 }),
    ['count']
  )
})
```

## Debugging Tests

### Running Specific Tests

```bash
# Run one file
npm test -- tests/services/base-service.test.js

# Run tests matching pattern
npm test -- --grep "caching"
```

### Using Console Logs

```javascript
it('should do something', () => {
  console.log('Debug info:', service.state)
  expect(service.doSomething()).toBe(true)
})
```

### Test UI

The Vitest UI provides an interactive interface:

```bash
npm run test:ui
```

This opens a browser showing:
- Test results in real-time
- Code coverage visualization
- Test execution timeline
- Console output

## Common Issues

### Issue: Tests fail with "Cannot find module"

**Solution**: Check import paths are correct and use `.js` extensions:
```javascript
import { BaseService } from '../../src/services/base-service.js'
```

### Issue: Supabase mock not working

**Solution**: Ensure mocks are set up before imports:
```javascript
vi.mock('../src/config/supabase.js', () => ({
  supabase: mockSupabaseClient
}))

import { supabase } from '../src/config/supabase.js'
```

### Issue: Tests pass locally but fail in CI

**Solution**: Check for:
- Hardcoded timestamps
- Race conditions
- File system dependencies
- Environment variables

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:run
      - run: npm run test:coverage
```

## Contributing

When adding new features:

1. **Write tests first** (TDD approach)
2. Run tests: `npm test`
3. Check coverage: `npm run test:coverage`
4. Ensure all tests pass before committing

### Test Checklist

- [ ] Tests cover happy path
- [ ] Tests cover error cases
- [ ] Tests are independent
- [ ] Mocks are cleaned up
- [ ] Test names are descriptive
- [ ] No skipped tests (`it.skip`)
- [ ] Coverage meets thresholds

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vitest API Reference](https://vitest.dev/api/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Last Updated**: 2025-11-29
**Test Count**: 68 tests passing
**Coverage**: 64.75% overall
