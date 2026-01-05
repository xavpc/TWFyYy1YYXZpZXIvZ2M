/**
 * Global Test Setup
 * Configures Jest environment for all tests
 */

// Increase test timeout for slow operations
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests (uncomment if needed)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

// Setup global mocks
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
  process.env.API_KEY = 'test-api-key';
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'mysql://test:test@localhost:3306/gomicollection_test';
});

afterAll(() => {
  // Cleanup after all tests
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Global error handling for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Export setup flag
export const testSetupComplete = true;
