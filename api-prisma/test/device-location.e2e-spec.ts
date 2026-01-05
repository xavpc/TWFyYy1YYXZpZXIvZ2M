import { INestApplication } from '@nestjs/common';
import {
  setupE2ETest,
  teardownE2ETest,
  cleanupDatabase,
  seedTestData,
  E2ETestContext,
  E2EAuthHelper,
} from '../src/test/e2e-setup';

describe('DeviceLocationController (e2e)', () => {
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

    // Create a session for location testing
    const session = await context.prisma.deviceSession.create({
      data: {
        session_id: 'e2e-session-for-location',
        start: new Date(),
        device_route_id: 'e2e-dr-id-001',
      },
    });
    sessionId = session.session_id;

    // Create test locations
    await context.prisma.deviceLocation.createMany({
      data: [
        {
          device_location_id: 'e2e-location-id-001',
          latitude: 35.6762,
          longitude: 139.6503,
          current_location_timestamp: new Date(),
          session_id: sessionId,
          device_id: 'e2e-device-id-001',
        },
        {
          device_location_id: 'e2e-location-id-002',
          latitude: 35.6770,
          longitude: 139.6510,
          current_location_timestamp: new Date(),
          session_id: sessionId,
          device_id: 'e2e-device-id-001',
        },
      ],
      skipDuplicates: true,
    });
  });

  afterAll(async () => {
    await cleanupDatabase(context.prisma);
    await teardownE2ETest(context);
  });

  describe('/device-location (GET)', () => {
    it('should return all device locations', async () => {
      const response = await authHelper.authenticatedRequest(adminToken).get('/device-locations');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body) || response.body.data).toBe(true);
    });

    it('should reject unauthenticated request', async () => {
      const response = await authHelper.unauthenticatedRequest().get('/device-locations');

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('/device-location/:id (GET)', () => {
    it('should return device location by ID', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/device-location/e2e-location-id-001');

      expect(response.status).toBe(200);
      expect(response.body.device_location_id).toBe('e2e-location-id-001');
    });

    it('should return 404 for non-existent location', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/device-location/nonexistent-id');

      expect(response.status).toBe(404);
    });
  });

  describe('/device-location (POST)', () => {
    it('should create new device location', async () => {
      const newLocation = {
        latitude: 35.6780,
        longitude: 139.6520,
        current_location_timestamp: new Date().toISOString(),
        session_id: sessionId,
        device_id: 'e2e-device-id-001',
      };

      const response = await authHelper
        .authenticatedRequest(adminToken)
        .post('/device-locations')
        .send(newLocation);

      expect([200, 201]).toContain(response.status);
      expect(response.body.latitude).toBe(35.6780);
    });

    it('should validate coordinates', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .post('/device-locations')
        .send({
          latitude: 999,
          longitude: 999,
          current_location_timestamp: new Date().toISOString(),
          session_id: sessionId,
          device_id: 'e2e-device-id-001',
        });

      expect([400, 422]).toContain(response.status);
    });

    it('should reject non-existent session', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .post('/device-locations')
        .send({
          latitude: 35.6762,
          longitude: 139.6503,
          current_location_timestamp: new Date().toISOString(),
          session_id: 'nonexistent-session',
          device_id: 'e2e-device-id-001',
        });

      expect([400, 404]).toContain(response.status);
    });
  });

  describe('/device-location/:id (DELETE)', () => {
    it('should delete device location', async () => {
      // Create location to delete
      const created = await context.prisma.deviceLocation.create({
        data: {
          device_location_id: `e2e-location-delete-${Date.now()}`,
          latitude: 35.6800,
          longitude: 139.6530,
          current_location_timestamp: new Date(),
          session_id: sessionId,
          device_id: 'e2e-device-id-001',
        },
      });

      const deleteResponse = await authHelper
        .authenticatedRequest(adminToken)
        .delete(`/device-location/${created.device_location_id}`);

      expect([200, 204]).toContain(deleteResponse.status);
    });
  });

  describe('/device-location/session/:sessionId (GET)', () => {
    it('should return locations for session', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get(`/device-location/session/${sessionId}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return empty array for session without locations', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/device-location/session/nonexistent-session');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('/device-location/latest/:sessionId (GET)', () => {
    it('should return latest location for session', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get(`/device-location/latest/${sessionId}`);

      expect(response.status).toBe(200);
    });
  });
});
