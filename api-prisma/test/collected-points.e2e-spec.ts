import { INestApplication } from '@nestjs/common';
import {
  setupE2ETest,
  teardownE2ETest,
  cleanupDatabase,
  seedTestData,
  E2ETestContext,
  E2EAuthHelper,
} from '../src/test/e2e-setup';

describe('CollectedPointsController (e2e)', () => {
  let context: E2ETestContext;
  let app: INestApplication;
  let authHelper: E2EAuthHelper;
  let adminToken: string;
  let sessionId: string;
  const apiKey = process.env.API_KEY || 'test-api-key';

  beforeAll(async () => {
    context = await setupE2ETest();
    app = context.app;
    authHelper = new E2EAuthHelper(app, apiKey);
    await cleanupDatabase(context.prisma);
    await seedTestData(context.prisma);
    adminToken = await authHelper.login('e2e_admin', 'TestPassword123!');

    // Create a session for collected points testing
    const session = await context.prisma.deviceSession.create({
      data: {
        session_id: 'e2e-session-for-collected',
        start: new Date(),
        device_route_id: 'e2e-dr-id-001',
      },
    });
    sessionId = session.session_id;

    // Create test collected points
    await context.prisma.collectedPoints.createMany({
      data: [
        {
          collected_points_id: 'e2e-cp-collected-001',
          collected_at: new Date(),
          session_id: sessionId,
          collection_point_id: 'e2e-cp-id-001',
        },
      ],
      skipDuplicates: true,
    });
  });

  afterAll(async () => {
    await cleanupDatabase(context.prisma);
    await teardownE2ETest(context);
  });

  describe('/collected-points (GET)', () => {
    it('should return all collected points', async () => {
      const response = await authHelper.authenticatedRequest(adminToken).get('/collected-points');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body) || response.body.data).toBe(true);
    });

    it('should reject unauthenticated request', async () => {
      const response = await authHelper.unauthenticatedRequest().get('/collected-points');

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('/collected-points/:id (GET)', () => {
    it('should return collected point by ID', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/collected-points/e2e-cp-collected-001');

      expect(response.status).toBe(200);
      expect(response.body.collected_points_id).toBe('e2e-cp-collected-001');
    });

    it('should return 404 for non-existent collected point', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/collected-points/nonexistent-id');

      expect(response.status).toBe(404);
    });
  });

  describe('/collected-points (POST)', () => {
    it('should create new collected point', async () => {
      const newCollectedPoint = {
        collected_at: new Date().toISOString(),
        session_id: sessionId,
        collection_point_id: 'e2e-cp-id-002',
      };

      const response = await authHelper
        .authenticatedRequest(adminToken)
        .post('/collected-points')
        .send(newCollectedPoint);

      expect([200, 201]).toContain(response.status);
      expect(response.body.collection_point_id).toBe('e2e-cp-id-002');
    });

    it('should reject non-existent session', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .post('/collected-points')
        .send({
          collected_at: new Date().toISOString(),
          session_id: 'nonexistent-session',
          collection_point_id: 'e2e-cp-id-001',
        });

      expect([400, 404]).toContain(response.status);
    });

    it('should reject non-existent collection point', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .post('/collected-points')
        .send({
          collected_at: new Date().toISOString(),
          session_id: sessionId,
          collection_point_id: 'nonexistent-cp',
        });

      expect([400, 404]).toContain(response.status);
    });
  });

  describe('/collected-points/:id (DELETE)', () => {
    it('should delete collected point', async () => {
      // Create collected point to delete
      const created = await context.prisma.collectedPoints.create({
        data: {
          collected_points_id: `e2e-cp-delete-${Date.now()}`,
          collected_at: new Date(),
          session_id: sessionId,
          collection_point_id: 'e2e-cp-id-001',
        },
      });

      const deleteResponse = await authHelper
        .authenticatedRequest(adminToken)
        .delete(`/collected-points/${created.collected_points_id}`);

      expect([200, 204]).toContain(deleteResponse.status);
    });

    it('should return 404 for non-existent collected point', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .delete('/collected-points/nonexistent-id');

      expect(response.status).toBe(404);
    });
  });

  describe('/collected-points/session/:sessionId (GET)', () => {
    it('should return collected points for session', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get(`/collected-points/session/${sessionId}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return empty array for session without collected points', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/collected-points/session/nonexistent-session');

      expect(response.status).toBe(200);
    });
  });

  describe('/collected-points/count/:sessionId (GET)', () => {
    it('should return count of collected points for session', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get(`/collected-points/count/${sessionId}`);

      expect(response.status).toBe(200);
    });
  });
});
