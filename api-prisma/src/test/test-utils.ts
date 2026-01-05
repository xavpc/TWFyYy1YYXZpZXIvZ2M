/**
 * Test Utilities for Unit Testing
 * Provides helper functions for creating test modules and common test patterns
 */

import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { Provider, Type } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrismaService, resetPrismaMocks } from './mocks/prisma.mock';
import { mockCloudinaryService, resetCloudinaryMocks } from './mocks/cloudinary.mock';

/**
 * Creates a testing module with mock Prisma service
 */
export async function createTestingModule(
  providers: Provider[],
  additionalMocks: Record<string, any> = {},
): Promise<TestingModule> {
  const moduleBuilder: TestingModuleBuilder = Test.createTestingModule({
    providers: [
      ...providers,
      {
        provide: PrismaService,
        useValue: mockPrismaService,
      },
      ...Object.entries(additionalMocks).map(([token, value]) => ({
        provide: token,
        useValue: value,
      })),
    ],
  });

  return moduleBuilder.compile();
}

/**
 * Creates a testing module for a service with common dependencies
 */
export async function createServiceTestingModule<T>(
  ServiceClass: Type<T>,
  additionalProviders: Provider[] = [],
  additionalMocks: Record<string, any> = {},
): Promise<{ module: TestingModule; service: T; prisma: typeof mockPrismaService }> {
  const module = await createTestingModule(
    [ServiceClass, ...additionalProviders],
    additionalMocks,
  );

  const service = module.get<T>(ServiceClass);
  const prisma = module.get(PrismaService);

  return { module, service, prisma };
}

/**
 * Resets all mocks between tests
 */
export function resetAllMocks(): void {
  resetPrismaMocks();
  resetCloudinaryMocks();
  jest.clearAllMocks();
}

/**
 * Creates a mock response for paginated data
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number = 1,
  limit: number = 10,
) {
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
}

/**
 * Creates a mock date for consistent testing
 */
export function createMockDate(dateString: string = '2024-01-15T08:00:00Z'): Date {
  return new Date(dateString);
}

/**
 * Sets up mock date for tests
 */
export function mockCurrentDate(dateString: string = '2024-01-15T08:00:00Z'): void {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(dateString));
}

/**
 * Restores real date
 */
export function restoreRealDate(): void {
  jest.useRealTimers();
}

/**
 * Creates a mock JWT token for testing
 */
export function createMockJwtToken(payload: Record<string, any> = {}): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const defaultPayload = {
    sub: 'test-user-id',
    username: 'testuser',
    role: 'admin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...payload,
  };
  const payloadBase64 = Buffer.from(JSON.stringify(defaultPayload)).toString('base64');
  const signature = 'mock-signature';
  return `${header}.${payloadBase64}.${signature}`;
}

/**
 * Creates mock request object for controller tests
 */
export function createMockRequest(overrides: Record<string, any> = {}) {
  return {
    user: {
      userId: 'test-user-id',
      username: 'testuser',
      role: 'admin',
    },
    headers: {
      'x-api-key': 'test-api-key',
      authorization: `Bearer ${createMockJwtToken()}`,
    },
    cookies: {},
    ...overrides,
  };
}

/**
 * Creates mock response object for controller tests
 */
export function createMockResponse() {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    download: jest.fn().mockReturnThis(),
  };
  return res;
}

/**
 * Waits for all promises to resolve in tests
 */
export async function flushPromises(): Promise<void> {
  await new Promise((resolve) => setImmediate(resolve));
}

/**
 * Creates a spy for a method that can be awaited
 */
export function createAsyncSpy<T>(resolvedValue: T): jest.Mock<Promise<T>> {
  return jest.fn().mockResolvedValue(resolvedValue);
}

/**
 * Creates a spy for a method that rejects
 */
export function createRejectingSpy(error: Error): jest.Mock<Promise<never>> {
  return jest.fn().mockRejectedValue(error);
}

/**
 * Matcher for checking if a date is within a range
 */
export function expectDateWithinRange(date: Date, startDate: Date, endDate: Date): void {
  expect(date.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
  expect(date.getTime()).toBeLessThanOrEqual(endDate.getTime());
}

/**
 * Helper to test validation errors
 */
export async function expectValidationError(
  action: () => Promise<any>,
  expectedMessage: string | RegExp,
): Promise<void> {
  await expect(action()).rejects.toThrow(expectedMessage);
}

/**
 * Helper to test NotFoundException
 */
export async function expectNotFound(
  action: () => Promise<any>,
  expectedMessage: string | RegExp = /not found/i,
): Promise<void> {
  await expect(action()).rejects.toThrow(expectedMessage);
}

/**
 * Helper to test ConflictException
 */
export async function expectConflict(
  action: () => Promise<any>,
  expectedMessage: string | RegExp = /already exists/i,
): Promise<void> {
  await expect(action()).rejects.toThrow(expectedMessage);
}

/**
 * Creates a test decorator for describing test suites
 */
export function describeService(serviceName: string, fn: () => void): void {
  describe(`${serviceName}`, fn);
}

/**
 * Creates a test decorator for describing methods
 */
export function describeMethod(methodName: string, fn: () => void): void {
  describe(`.${methodName}()`, fn);
}

/**
 * Helper to setup common beforeEach hooks
 */
export function setupTestEnvironment(): void {
  beforeEach(() => {
    resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
}

/**
 * Type helper for mock functions
 */
export type MockedFunction<T extends (...args: any[]) => any> = jest.MockedFunction<T>;

/**
 * Type helper for mocked objects
 */
export type MockedObject<T> = { [K in keyof T]: T[K] extends (...args: any[]) => any ? MockedFunction<T[K]> : T[K] };
