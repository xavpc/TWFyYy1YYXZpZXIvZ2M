import { INestApplication } from '@nestjs/common';
import {
  setupE2ETest,
  teardownE2ETest,
  cleanupDatabase,
  seedTestData,
  E2ETestContext,
  E2EAuthHelper,
} from '../src/test/e2e-setup';

describe('DeviceRouteController (e2e)', () => {
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
    adminToken = await authHelper.login('e2e_admin', 'TestPassword123!');
  });

  afterAll(async () => {
    await cleanupDatabase(context.prisma);
    await teardownE2ETest(context);
  });

  describe('/device-route (GET)', () => {
    it('should return all device routes', async () => {
      const response = await authHelper.authenticatedRequest(adminToken).get('/device-route');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body) || response.body.data).toBe(true);
    });

    it('should reject unauthenticated request', async () => {
      const response = await authHelper.unauthenticatedRequest().get('/device-route');

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('/device-route/:id (GET)', () => {
    it('should return device route by ID', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/device-route/e2e-dr-id-001');

      expect(response.status).toBe(200);
      expect(response.body.device_route_id).toBe('e2e-dr-id-001');
    });

    it('should return 404 for non-existent device route', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/device-route/nonexistent-id');

      expect(response.status).toBe(404);
    });
  });

  describe('/device-route (POST)', () => {
    it('should create new device route', async () => {
      const newDeviceRoute = {
        day_assigned: 'wednesday',
        device_id: 'e2e-device-id-001',
        route_id: 'e2e-route-id-002',
      };

      const response = await authHelper
        .authenticatedRequest(adminToken)
        .post('/device-route')
        .send(newDeviceRoute);

      expect([200, 201]).toContain(response.status);
      expect(response.body.day_assigned).toBe('wednesday');
    });

    it('should reject non-existent device', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .post('/device-route')
        .send({
          day_assigned: 'monday',
          device_id: 'nonexistent-device',
          route_id: 'e2e-route-id-001',
        });

      expect([400, 404]).toContain(response.status);
    });

    it('should reject non-existent route', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .post('/device-route')
        .send({
          day_assigned: 'monday',
          device_id: 'e2e-device-id-001',
          route_id: 'nonexistent-route',
        });

      expect([400, 404]).toContain(response.status);
    });

    it('should validate day_assigned', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .post('/device-route')
        .send({
          day_assigned: 'invalid_day',
          device_id: 'e2e-device-id-001',
          route_id: 'e2e-route-id-001',
        });

      expect([400, 422]).toContain(response.status);
    });
  });

  describe('/device-route/:id (PUT/PATCH)', () => {
    it('should update device route', async () => {
      const updateData = {
        day_assigned: 'thursday',
      };

      const patchResponse = await authHelper
        .authenticatedRequest(adminToken)
        .patch('/device-route/e2e-dr-id-001')
        .send(updateData);

      if (patchResponse.status === 404) {
        const putResponse = await authHelper
          .authenticatedRequest(adminToken)
          .put('/device-route/e2e-dr-id-001')
          .send(updateData);
        expect([200, 201]).toContain(putResponse.status);
      } else {
        expect([200, 201]).toContain(patchResponse.status);
      }
    });

    it('should return 404 for non-existent device route', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .patch('/device-route/nonexistent-id')
        .send({ day_assigned: 'friday' });

      expect(response.status).toBe(404);
    });
  });

  describe('/device-route/:id (DELETE)', () => {
    it('should delete device route', async () => {
      // Create a device route to delete
      const created = await context.prisma.deviceRoute.create({
        data: {
          device_route_id: `e2e-dr-delete-${Date.now()}`,
          day_assigned: 'saturday',
          device_id: 'e2e-device-id-001',
          route_id: 'e2e-route-id-001',
        },
      });

      const deleteResponse = await authHelper
        .authenticatedRequest(adminToken)
        .delete(`/device-route/${created.device_route_id}`);

      expect([200, 204]).toContain(deleteResponse.status);
    });

    it('should return 404 for non-existent device route', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .delete('/device-route/nonexistent-id');

      expect(response.status).toBe(404);
    });
  });

  describe('/device-route/device/:deviceId (GET)', () => {
    it('should return routes for device', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/device-route/device/e2e-device-id-001');

      expect(response.status).toBe(200);
    });
  });

  describe('/device-route/route/:routeId (GET)', () => {
    it('should return devices for route', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/device-route/route/e2e-route-id-001');

      expect(response.status).toBe(200);
    });
  });

  describe('/device-route/by-day/:day (GET)', () => {
    it('should return device routes by day', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/device-route/by-day/monday');

      expect(response.status).toBe(200);
    });
  });
});
