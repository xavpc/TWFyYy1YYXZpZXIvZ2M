import { INestApplication } from '@nestjs/common';
import {
  setupE2ETest,
  teardownE2ETest,
  cleanupDatabase,
  seedTestData,
  E2ETestContext,
  E2EAuthHelper,
} from '../src/test/e2e-setup';

describe('ImageController (e2e)', () => {
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

  describe('/image (GET)', () => {
    it('should return all images', async () => {
      const response = await authHelper.authenticatedRequest(adminToken).get('/images');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body) || response.body.data).toBe(true);
    });

    it('should reject unauthenticated request', async () => {
      const response = await authHelper.unauthenticatedRequest().get('/images');

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('/image/:id (GET)', () => {
    it('should return image by ID', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/image/e2e-image-id-001');

      expect(response.status).toBe(200);
      expect(response.body.image_id).toBe('e2e-image-id-001');
    });

    it('should return 404 for non-existent image', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/image/nonexistent-id');

      expect(response.status).toBe(404);
    });
  });

  describe('/image/:id (PUT/PATCH)', () => {
    it('should update image status', async () => {
      const updateData = {
        status: 'inactive',
      };

      const patchResponse = await authHelper
        .authenticatedRequest(adminToken)
        .patch('/image/e2e-image-id-001')
        .send(updateData);

      if (patchResponse.status === 404) {
        const putResponse = await authHelper
          .authenticatedRequest(adminToken)
          .put('/image/e2e-image-id-001')
          .send(updateData);
        expect([200, 201]).toContain(putResponse.status);
      } else {
        expect([200, 201]).toContain(patchResponse.status);
      }
    });

    it('should return 404 for non-existent image', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .patch('/image/nonexistent-id')
        .send({ status: 'inactive' });

      expect(response.status).toBe(404);
    });
  });

  describe('/image/route/:routeId (GET)', () => {
    it('should return images for route', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/image/route/e2e-route-id-001');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return empty array for route without images', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/image/route/e2e-route-id-002');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('/image/status/:status (GET)', () => {
    it('should return images by status', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/image/status/active');

      expect(response.status).toBe(200);
    });
  });
});
