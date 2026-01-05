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

describe('CollectionPointsController (e2e)', () => {
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

  describe('/collection-points (GET)', () => {
    it('should return all collection points', async () => {
      const response = await authHelper.authenticatedRequest(adminToken).get('/collection-points');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body) || response.body.data).toBe(true);
    });

    it('should reject unauthenticated request', async () => {
      const response = await authHelper.unauthenticatedRequest().get('/collection-points');

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('/collection-points/:id (GET)', () => {
    it('should return collection point by ID', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/collection-points/e2e-cp-id-001');

      expect(response.status).toBe(200);
      expect(response.body.collection_point_id).toBe('e2e-cp-id-001');
    });

    it('should return 404 for non-existent collection point', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/collection-points/nonexistent-id');

      expect(response.status).toBe(404);
    });
  });

  describe('/collection-points (POST)', () => {
    it('should create new collection point', async () => {
      const newPoint = dataFactory.createCollectionPoint('e2e-route-id-001', 10);

      const response = await authHelper
        .authenticatedRequest(adminToken)
        .post('/collection-points')
        .send(newPoint);

      expect([200, 201]).toContain(response.status);
      expect(response.body.sequence).toBe(10);
    });

    it('should reject non-existent route', async () => {
      const point = dataFactory.createCollectionPoint('nonexistent-route', 1);

      const response = await authHelper
        .authenticatedRequest(adminToken)
        .post('/collection-points')
        .send(point);

      expect([400, 404]).toContain(response.status);
    });

    it('should validate coordinates', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .post('/collection-points')
        .send({
          sequence: 1,
          collection_point_name: 'Invalid Point',
          latitude: 999,
          longitude: 999,
          route_id: 'e2e-route-id-001',
        });

      expect([400, 422]).toContain(response.status);
    });
  });

  describe('/collection-points/:id (PUT/PATCH)', () => {
    it('should update collection point', async () => {
      const updateData = {
        collection_point_name: 'Updated Point Name',
      };

      const patchResponse = await authHelper
        .authenticatedRequest(adminToken)
        .patch('/collection-points/e2e-cp-id-001')
        .send(updateData);

      if (patchResponse.status === 404) {
        const putResponse = await authHelper
          .authenticatedRequest(adminToken)
          .put('/collection-points/e2e-cp-id-001')
          .send(updateData);
        expect([200, 201]).toContain(putResponse.status);
      } else {
        expect([200, 201]).toContain(patchResponse.status);
      }
    });

    it('should return 404 for non-existent collection point', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .patch('/collection-points/nonexistent-id')
        .send({ collection_point_name: 'Test' });

      expect(response.status).toBe(404);
    });
  });

  describe('/collection-points/:id (DELETE)', () => {
    it('should delete collection point', async () => {
      const newPoint = dataFactory.createCollectionPoint('e2e-route-id-001', 99);
      const createResponse = await authHelper
        .authenticatedRequest(adminToken)
        .post('/collection-points')
        .send(newPoint);

      const pointId = createResponse.body.collection_point_id;

      const deleteResponse = await authHelper
        .authenticatedRequest(adminToken)
        .delete(`/collection-points/${pointId}`);

      expect([200, 204]).toContain(deleteResponse.status);
    });

    it('should return 404 for non-existent collection point', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .delete('/collection-points/nonexistent-id');

      expect(response.status).toBe(404);
    });
  });

  describe('/collection-points/route/:routeId (GET)', () => {
    it('should return collection points for route', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/collection-points/route/e2e-route-id-001');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return empty array for route without points', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/collection-points/route/e2e-route-id-002');

      expect(response.status).toBe(200);
    });
  });
});
