import { INestApplication } from '@nestjs/common';
import {
  setupE2ETest,
  teardownE2ETest,
  cleanupDatabase,
  seedTestData,
  E2ETestContext,
  E2EAuthHelper,
} from '../src/test/e2e-setup';

describe('DeviceSessionController (e2e)', () => {
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

  describe('/device-session (GET)', () => {
    it('should return all device sessions', async () => {
      const response = await authHelper.authenticatedRequest(adminToken).get('/device-session');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body) || response.body.data).toBe(true);
    });

    it('should reject unauthenticated request', async () => {
      const response = await authHelper.unauthenticatedRequest().get('/device-session');

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('/device-session/:id (GET)', () => {
    it('should return 404 for non-existent session', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/device-session/nonexistent-id');

      expect(response.status).toBe(404);
    });
  });

  describe('/device-session/start (POST)', () => {
    it('should start a new session', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .post('/device-session/start')
        .send({
          device_route_id: 'e2e-dr-id-001',
        });

      expect([200, 201]).toContain(response.status);
      expect(response.body.session_id).toBeDefined();
    });

    it('should reject non-existent device route', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .post('/device-session/start')
        .send({
          device_route_id: 'nonexistent-device-route',
        });

      expect([400, 404]).toContain(response.status);
    });
  });

  describe('/device-session/:id/end (POST/PATCH)', () => {
    it('should end an active session', async () => {
      // First create a session
      const startResponse = await authHelper
        .authenticatedRequest(adminToken)
        .post('/device-session/start')
        .send({
          device_route_id: 'e2e-dr-id-002',
        });

      const sessionId = startResponse.body.session_id;

      // Try PATCH first, then POST
      let endResponse = await authHelper
        .authenticatedRequest(adminToken)
        .patch(`/device-session/${sessionId}/end`);

      if (endResponse.status === 404) {
        endResponse = await authHelper
          .authenticatedRequest(adminToken)
          .post(`/device-session/${sessionId}/end`);
      }

      expect([200, 201]).toContain(endResponse.status);
      expect(endResponse.body.end).toBeDefined();
    });

    it('should return 404 for non-existent session', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .patch('/device-session/nonexistent-id/end');

      expect([400, 404]).toContain(response.status);
    });
  });

  describe('/device-session/active (GET)', () => {
    it('should return active sessions', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/device-session/active');

      expect(response.status).toBe(200);
    });
  });

  describe('/device-session/device/:deviceId (GET)', () => {
    it('should return sessions for device', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/device-session/device/e2e-device-id-001');

      expect(response.status).toBe(200);
    });
  });

  describe('/device-session/date-range (GET)', () => {
    it('should return sessions within date range', async () => {
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get(
          `/device-session/date-range?start=${weekAgo.toISOString()}&end=${today.toISOString()}`,
        );

      expect(response.status).toBe(200);
    });
  });

  describe('/device-session/recently-ended (GET)', () => {
    it('should return recently ended sessions', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/device-session/recently-ended');

      expect(response.status).toBe(200);
    });
  });
});
