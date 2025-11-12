# Test Suite for Conversion Tools Node SDK

This directory contains comprehensive tests for the Conversion Tools npm library using **Vitest**.

## Test Structure

```
tests/
├── client.test.ts         # Main ConversionToolsClient tests
├── validation.test.ts     # Input validation tests
├── files.test.ts         # Files API tests
├── tasks.test.ts         # Tasks API tests
├── errors.test.ts        # Error class tests
└── integration.test.ts   # End-to-end integration tests
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

## Test Coverage

The test suite covers:

- **Client Initialization**: API token validation, configuration handling
- **Files API**: Upload, download, metadata retrieval
- **Tasks API**: Task creation, status checking, listing
- **Validation**: Input validation for all API parameters
- **Error Handling**: All custom error classes
- **Integration**: End-to-end workflows

## Writing Tests

Tests use Vitest with the following conventions:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should do something', () => {
    expect(result).toBe(expected);
  });
});
```

### Mocking

External dependencies are mocked:
- `fs` module for file operations
- `HttpClient` for API calls
- Network requests

Example:
```typescript
vi.mock('fs');
vi.mock('../src/api/http');
```

## Test Configuration

Configuration is in `vitest.config.ts`:
- Environment: Node.js
- Coverage provider: v8
- Global test APIs enabled

## CI/CD Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# GitHub Actions example
- name: Run tests
  run: npm test
  
- name: Upload coverage
  run: npm run test:coverage
```

## Troubleshooting

### Tests failing to run
1. Ensure dependencies are installed: `npm install`
2. Check Node.js version: `node --version` (requires >= 18.0.0)
3. Clear cache: `npm run test -- --clearCache`

### Mocks not working
- Ensure mocks are defined before imports
- Use `vi.clearAllMocks()` in `beforeEach`
- Check mock file paths match actual imports
