import { INestApplication } from '@nestjs/common';
import {
  setupE2ETest,
  teardownE2ETest,
  cleanupDatabase,
  seedTestData,
  E2ETestContext,
  E2EAuthHelper,
} from '../src/test/e2e-setup';

describe('RouteCoordinatesController (e2e)', () => {
  let context: E2ETestContext;
  let app: INestApplication;
  let authHelper: E2EAuthHelper;
  let adminToken: string;
  const apiKey = process.env.API_KEY || 'test-api-key';

  beforeAll(async () => {
    context = await setupE2ETest();
    app = context.app;
    authHelper = new E2EAuthHelper(app, apiKey);
    await cleanupDatabase(context.prisma);
    await seedTestData(context.prisma);

    // Create route coordinates for testing
    await context.prisma.routeCoordinates.createMany({
      data: [
        {
          route_coordinates_id: 'e2e-rc-id-001',
          sequence: 1,
          latitude: 35.6762,
          longitude: 139.6503,
          route_id: 'e2e-route-id-001',
        },
        {
          route_coordinates_id: 'e2e-rc-id-002',
          sequence: 2,
          latitude: 35.6770,
          longitude: 139.6510,
          route_id: 'e2e-route-id-001',
        },
      ],
      skipDuplicates: true,
    });

    adminToken = await authHelper.login('e2e_admin', 'TestPassword123!');
  });

  afterAll(async () => {
    await cleanupDatabase(context.prisma);
    await teardownE2ETest(context);
  });

  describe('/route-coordinates (GET)', () => {
    it('should return all route coordinates', async () => {
      const response = await authHelper.authenticatedRequest(adminToken).get('/route-coordinates');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body) || response.body.data).toBe(true);
    });

    it('should reject unauthenticated request', async () => {
      const response = await authHelper.unauthenticatedRequest().get('/route-coordinates');

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('/route-coordinates/:id (GET)', () => {
    it('should return route coordinates by ID', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/route-coordinates/e2e-rc-id-001');

      expect(response.status).toBe(200);
      expect(response.body.route_coordinates_id).toBe('e2e-rc-id-001');
    });

    it('should return 404 for non-existent route coordinates', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/route-coordinates/nonexistent-id');

      expect(response.status).toBe(404);
    });
  });

  describe('/route-coordinates (POST)', () => {
    it('should create new route coordinates', async () => {
      const newCoords = {
        sequence: 3,
        latitude: 35.6780,
        longitude: 139.6520,
        route_id: 'e2e-route-id-001',
      };

      const response = await authHelper
        .authenticatedRequest(adminToken)
        .post('/route-coordinates')
        .send(newCoords);

      expect([200, 201]).toContain(response.status);
      expect(response.body.sequence).toBe(3);
    });

    it('should validate coordinates', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .post('/route-coordinates')
        .send({
          sequence: 1,
          latitude: 999,
          longitude: 999,
          route_id: 'e2e-route-id-001',
        });

      expect([400, 422]).toContain(response.status);
    });

    it('should reject non-existent route', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .post('/route-coordinates')
        .send({
          sequence: 1,
          latitude: 35.6762,
          longitude: 139.6503,
          route_id: 'nonexistent-route',
        });

      expect([400, 404]).toContain(response.status);
    });
  });

  describe('/route-coordinates/:id (PUT/PATCH)', () => {
    it('should update route coordinates', async () => {
      const updateData = {
        latitude: 35.6790,
      };

      const patchResponse = await authHelper
        .authenticatedRequest(adminToken)
        .patch('/route-coordinates/e2e-rc-id-001')
        .send(updateData);

      if (patchResponse.status === 404) {
        const putResponse = await authHelper
          .authenticatedRequest(adminToken)
          .put('/route-coordinates/e2e-rc-id-001')
          .send(updateData);
        expect([200, 201]).toContain(putResponse.status);
      } else {
        expect([200, 201]).toContain(patchResponse.status);
      }
    });
  });

  describe('/route-coordinates/:id (DELETE)', () => {
    it('should delete route coordinates', async () => {
      // Create coords to delete
      const created = await context.prisma.routeCoordinates.create({
        data: {
          route_coordinates_id: `e2e-rc-delete-${Date.now()}`,
          sequence: 99,
          latitude: 35.6800,
          longitude: 139.6530,
          route_id: 'e2e-route-id-001',
        },
      });

      const deleteResponse = await authHelper
        .authenticatedRequest(adminToken)
        .delete(`/route-coordinates/${created.route_coordinates_id}`);

      expect([200, 204]).toContain(deleteResponse.status);
    });
  });

  describe('/route-coordinates/route/:routeId (GET)', () => {
    it('should return coordinates for route', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/route-coordinates/route/e2e-route-id-001');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
