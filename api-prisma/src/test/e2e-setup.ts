/**
 * E2E Test Setup Utilities
 * Provides helper functions for setting up and tearing down E2E tests
 */

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import * as request from 'supertest';

/**
 * E2E Test Application Setup
 */
export interface E2ETestContext {
  app: INestApplication;
  prisma: PrismaService;
  httpServer: any;
}

/**
 * Sets up the E2E test application
 */
export async function setupE2ETest(): Promise<E2ETestContext> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  // Apply global pipes (same as main.ts)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  await app.init();

  const prisma = app.get(PrismaService);
  const httpServer = app.getHttpServer();

  return { app, prisma, httpServer };
}

/**
 * Tears down the E2E test application
 */
export async function teardownE2ETest(context: E2ETestContext): Promise<void> {
  await context.app.close();
}

/**
 * Cleans up the database in reverse dependency order
 */
export async function cleanupDatabase(prisma: PrismaService): Promise<void> {
  // Delete in reverse dependency order
  await prisma.reports.deleteMany();
  await prisma.complaints.deleteMany();
  await prisma.collectedPoints.deleteMany();
  await prisma.deviceLocation.deleteMany();
  await prisma.deviceSession.deleteMany();
  await prisma.image.deleteMany();
  await prisma.deviceRoute.deleteMany();
  await prisma.collectionPoints.deleteMany();
  await prisma.routeCoordinates.deleteMany();
  await prisma.device.deleteMany();
  await prisma.route.deleteMany();
  await prisma.users.deleteMany();
  await prisma.employee.deleteMany();
}

/**
 * Seeds test data for E2E tests
 */
export async function seedTestData(prisma: PrismaService): Promise<void> {
  const bcrypt = await import('bcrypt');
  const hashedPassword = await bcrypt.hash('TestPassword123!', 10);

  // Create test users
  await prisma.users.createMany({
    data: [
      {
        user_id: 'e2e-admin-user-id',
        username: 'e2e_admin',
        hashed_password: hashedPassword,
        role: 'admin',
        status: 'active',
      },
      {
        user_id: 'e2e-collector-user-id',
        username: 'e2e_collector',
        hashed_password: hashedPassword,
        role: 'garbage_collector',
        status: 'active',
      },
    ],
    skipDuplicates: true,
  });

  // Create test employees
  await prisma.employee.createMany({
    data: [
      {
        employee_id: 'e2e-employee-id-001',
        first_name: 'E2E',
        middle_name: 'Test',
        last_name: 'Employee',
        email: 'e2e.employee@test.com',
        contact_number: '090-1111-1111',
        address: 'E2E Test Address 1',
        age: 30,
        status: 'active',
      },
      {
        employee_id: 'e2e-employee-id-002',
        first_name: 'E2E',
        middle_name: null,
        last_name: 'Worker',
        email: 'e2e.worker@test.com',
        contact_number: '090-2222-2222',
        address: 'E2E Test Address 2',
        age: 25,
        status: 'active',
      },
    ],
    skipDuplicates: true,
  });

  // Create test routes
  await prisma.route.createMany({
    data: [
      {
        route_id: 'e2e-route-id-001',
        route_name: 'E2E Test Route 1',
        center_latitude: 35.6762,
        center_longitude: 139.6503,
      },
      {
        route_id: 'e2e-route-id-002',
        route_name: 'E2E Test Route 2',
        center_latitude: 35.6892,
        center_longitude: 139.6917,
      },
    ],
    skipDuplicates: true,
  });

  // Create test devices
  await prisma.device.createMany({
    data: [
      {
        device_id: 'e2e-device-id-001',
        device_name: 'E2E-Truck-001',
        vehicle_plate_num: 'E2E-1111',
        status: 'active',
        employee_id: 'e2e-employee-id-001',
      },
      {
        device_id: 'e2e-device-id-002',
        device_name: 'E2E-Truck-002',
        vehicle_plate_num: 'E2E-2222',
        status: 'active',
        employee_id: 'e2e-employee-id-002',
      },
    ],
    skipDuplicates: true,
  });

  // Create test collection points
  await prisma.collectionPoints.createMany({
    data: [
      {
        collection_point_id: 'e2e-cp-id-001',
        sequence: 1,
        collection_point_name: 'E2E Point 1',
        latitude: 35.6762,
        longitude: 139.6503,
        route_id: 'e2e-route-id-001',
      },
      {
        collection_point_id: 'e2e-cp-id-002',
        sequence: 2,
        collection_point_name: 'E2E Point 2',
        latitude: 35.6770,
        longitude: 139.6510,
        route_id: 'e2e-route-id-001',
      },
    ],
    skipDuplicates: true,
  });

  // Create test device routes
  await prisma.deviceRoute.createMany({
    data: [
      {
        device_route_id: 'e2e-dr-id-001',
        day_assigned: 'monday',
        device_id: 'e2e-device-id-001',
        route_id: 'e2e-route-id-001',
      },
      {
        device_route_id: 'e2e-dr-id-002',
        day_assigned: 'tuesday',
        device_id: 'e2e-device-id-002',
        route_id: 'e2e-route-id-002',
      },
    ],
    skipDuplicates: true,
  });

  // Create test images
  await prisma.image.createMany({
    data: [
      {
        image_id: 'e2e-image-id-001',
        image_url: 'https://example.com/e2e-image-1.jpg',
        file_name: 'e2e-image-1.jpg',
        status: 'active',
        route_id: 'e2e-route-id-001',
      },
    ],
    skipDuplicates: true,
  });
}

/**
 * Authentication helper for E2E tests
 */
export class E2EAuthHelper {
  private app: INestApplication;
  private apiKey: string;

  constructor(app: INestApplication, apiKey: string = process.env.API_KEY || 'test-api-key') {
    this.app = app;
    this.apiKey = apiKey;
  }

  /**
   * Logs in and returns the JWT token
   */
  async login(username: string, password: string): Promise<string> {
    const response = await request(this.app.getHttpServer())
      .post('/auth/login')
      .set('x-api-key', this.apiKey)
      .send({ username, password });

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`Login failed: ${response.status} - ${JSON.stringify(response.body)}`);
    }

    // Extract token from response body or cookie
    const token = response.body?.access_token || response.body?.token;
    if (token) {
      return token;
    }

    // Try to extract from cookies (access_token cookie)
    const cookies = response.headers['set-cookie'];
    if (cookies) {
      const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
      // Look for access_token cookie
      const accessTokenCookie = cookieArray.find((c: string) => c.startsWith('access_token='));
      if (accessTokenCookie) {
        const match = accessTokenCookie.match(/access_token=([^;]+)/);
        if (match) {
          return match[1];
        }
      }
      // Fallback: look for jwt cookie
      const jwtCookie = cookieArray.find((c: string) => c.startsWith('jwt='));
      if (jwtCookie) {
        const match = jwtCookie.match(/jwt=([^;]+)/);
        if (match) {
          return match[1];
        }
      }
    }

    throw new Error('No token found in response');
  }

  /**
   * Creates an authenticated request
   */
  authenticatedRequest(token: string) {
    return {
      get: (url: string) =>
        request(this.app.getHttpServer())
          .get(url)
          .set('Authorization', `Bearer ${token}`)
          .set('x-api-key', this.apiKey),
      post: (url: string) =>
        request(this.app.getHttpServer())
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .set('x-api-key', this.apiKey),
      put: (url: string) =>
        request(this.app.getHttpServer())
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .set('x-api-key', this.apiKey),
      patch: (url: string) =>
        request(this.app.getHttpServer())
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .set('x-api-key', this.apiKey),
      delete: (url: string) =>
        request(this.app.getHttpServer())
          .delete(url)
          .set('Authorization', `Bearer ${token}`)
          .set('x-api-key', this.apiKey),
    };
  }

  /**
   * Creates a request with only API key (for login endpoint)
   */
  apiKeyRequest() {
    return {
      get: (url: string) =>
        request(this.app.getHttpServer()).get(url).set('x-api-key', this.apiKey),
      post: (url: string) =>
        request(this.app.getHttpServer()).post(url).set('x-api-key', this.apiKey),
      put: (url: string) =>
        request(this.app.getHttpServer()).put(url).set('x-api-key', this.apiKey),
      patch: (url: string) =>
        request(this.app.getHttpServer()).patch(url).set('x-api-key', this.apiKey),
      delete: (url: string) =>
        request(this.app.getHttpServer()).delete(url).set('x-api-key', this.apiKey),
    };
  }

  /**
   * Creates a request without any authentication
   */
  unauthenticatedRequest() {
    return {
      get: (url: string) => request(this.app.getHttpServer()).get(url),
      post: (url: string) => request(this.app.getHttpServer()).post(url),
      put: (url: string) => request(this.app.getHttpServer()).put(url),
      patch: (url: string) => request(this.app.getHttpServer()).patch(url),
      delete: (url: string) => request(this.app.getHttpServer()).delete(url),
    };
  }
}

/**
 * Test data factory for creating unique test data
 */
export class E2ETestDataFactory {
  private counter = 0;

  private getNextId(): string {
    this.counter++;
    return `e2e-gen-${Date.now()}-${this.counter}`;
  }

  createEmployee() {
    const id = this.getNextId();
    return {
      first_name: `E2E_First_${id}`,
      last_name: `E2E_Last_${id}`,
      email: `e2e_${id}@test.com`,
      contact_number: '090-9999-9999',
      address: `E2E Address ${id}`,
      age: 25 + (this.counter % 50),
      status: 'active',
    };
  }

  createDevice(employeeId: string) {
    const id = this.getNextId();
    return {
      device_name: `E2E_Device_${id}`,
      vehicle_plate_num: `E2E-${this.counter}`,
      status: 'active',
      employee_id: employeeId,
    };
  }

  createRoute() {
    const id = this.getNextId();
    return {
      route_name: `E2E Route ${id}`,
      center_latitude: 35.6762 + (this.counter * 0.001),
      center_longitude: 139.6503 + (this.counter * 0.001),
    };
  }

  createCollectionPoint(routeId: string, sequence: number) {
    const id = this.getNextId();
    return {
      sequence,
      collection_point_name: `E2E CP ${id}`,
      latitude: 35.6762 + (sequence * 0.001),
      longitude: 139.6503 + (sequence * 0.001),
      route_id: routeId,
    };
  }

  createComplaint(imageId: string, deviceId: string) {
    const id = this.getNextId();
    return {
      title: `E2E Complaint ${id}`,
      description: `E2E Description for complaint ${id}`,
      latitude: 35.6762,
      longitude: 139.6503,
      complaint_timestamp: new Date(),
      image_id: imageId,
      device_id: deviceId,
    };
  }

  reset() {
    this.counter = 0;
  }
}
