import { INestApplication } from '@nestjs/common';
import {
  setupE2ETest,
  teardownE2ETest,
  cleanupDatabase,
  seedTestData,
  E2ETestContext,
  E2EAuthHelper,
  E2ETestDataFactory,
} from '../src/test/e2e-setup';

describe('RouteController (e2e)', () => {
  let context: E2ETestContext;
  let app: INestApplication;
  let authHelper: E2EAuthHelper;
  let dataFactory: E2ETestDataFactory;
  let adminToken: string;
  const apiKey = process.env.API_KEY || 'test-api-key';

  beforeAll(async () => {
    context = await setupE2ETest();
    app = context.app;
    authHelper = new E2EAuthHelper(app, apiKey);
    dataFactory = new E2ETestDataFactory();
    await cleanupDatabase(context.prisma);
    await seedTestData(context.prisma);
    adminToken = await authHelper.login('e2e_admin', 'TestPassword123!');
  });

  afterAll(async () => {
    await cleanupDatabase(context.prisma);
    await teardownE2ETest(context);
  });

  describe('/route (GET)', () => {
    it('should return all routes', async () => {
      const response = await authHelper.authenticatedRequest(adminToken).get('/routes');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body) || response.body.data).toBe(true);
    });

    it('should reject unauthenticated request', async () => {
      const response = await authHelper.unauthenticatedRequest().get('/routes');

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('/route/:id (GET)', () => {
    it('should return route by ID', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/route/e2e-route-id-001');

      expect(response.status).toBe(200);
      expect(response.body.route_id).toBe('e2e-route-id-001');
    });

    it('should return 404 for non-existent route', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/route/nonexistent-id');

      expect(response.status).toBe(404);
    });
  });

  describe('/route (POST)', () => {
    it('should create new route', async () => {
      const newRoute = dataFactory.createRoute();

      const response = await authHelper
        .authenticatedRequest(adminToken)
        .post('/routes')
        .send(newRoute);

      expect([200, 201]).toContain(response.status);
      expect(response.body.route_name).toBe(newRoute.route_name);
    });

    it('should reject duplicate route name', async () => {
      const route = dataFactory.createRoute();
      route.route_name = 'E2E Test Route 1';

      const response = await authHelper
        .authenticatedRequest(adminToken)
        .post('/routes')
        .send(route);

      expect([400, 409]).toContain(response.status);
    });

    it('should validate coordinates', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .post('/routes')
        .send({
          route_name: 'Invalid Coords Route',
          center_latitude: 999,
          center_longitude: 999,
        });

      expect([400, 422]).toContain(response.status);
    });
  });

  describe('/route/:id (PUT/PATCH)', () => {
    it('should update route', async () => {
      const updateData = {
        route_name: 'Updated Route Name',
      };

      const patchResponse = await authHelper
        .authenticatedRequest(adminToken)
        .patch('/route/e2e-route-id-001')
        .send(updateData);

      if (patchResponse.status === 404) {
        const putResponse = await authHelper
          .authenticatedRequest(adminToken)
          .put('/route/e2e-route-id-001')
          .send(updateData);
        expect([200, 201]).toContain(putResponse.status);
      } else {
        expect([200, 201]).toContain(patchResponse.status);
      }
    });

    it('should return 404 for non-existent route', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .patch('/route/nonexistent-id')
        .send({ route_name: 'Test' });

      expect(response.status).toBe(404);
    });
  });

  describe('/route/:id (DELETE)', () => {
    it('should delete route', async () => {
      const newRoute = dataFactory.createRoute();
      const createResponse = await authHelper
        .authenticatedRequest(adminToken)
        .post('/routes')
        .send(newRoute);

      const routeId = createResponse.body.route_id;

      const deleteResponse = await authHelper
        .authenticatedRequest(adminToken)
        .delete(`/route/${routeId}`);

      expect([200, 204]).toContain(deleteResponse.status);
    });

    it('should return 404 for non-existent route', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .delete('/route/nonexistent-id');

      expect(response.status).toBe(404);
    });
  });

  describe('/route/search (GET)', () => {
    it('should search routes by name', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/route/search?query=E2E');

      expect(response.status).toBe(200);
    });
  });

  describe('/route/with-collection-points (GET)', () => {
    it('should return routes with collection points', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/route/with-collection-points');

      expect(response.status).toBe(200);
    });
  });
});
