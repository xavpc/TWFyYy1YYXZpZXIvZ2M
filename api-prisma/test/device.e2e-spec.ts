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

describe('DeviceController (e2e)', () => {
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

  describe('/device (GET)', () => {
    it('should return all devices', async () => {
      const response = await authHelper.authenticatedRequest(adminToken).get('/devices');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body) || response.body.data).toBe(true);
    });

    it('should reject unauthenticated request', async () => {
      const response = await authHelper.unauthenticatedRequest().get('/devices');

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('/device/:id (GET)', () => {
    it('should return device by ID', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/device/e2e-device-id-001');

      expect(response.status).toBe(200);
      expect(response.body.device_id).toBe('e2e-device-id-001');
    });

    it('should return 404 for non-existent device', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/device/nonexistent-id');

      expect(response.status).toBe(404);
    });
  });

  describe('/device (POST)', () => {
    it('should create new device', async () => {
      const newDevice = dataFactory.createDevice('e2e-employee-id-001');

      const response = await authHelper
        .authenticatedRequest(adminToken)
        .post('/devices')
        .send(newDevice);

      expect([200, 201]).toContain(response.status);
      expect(response.body.device_name).toBe(newDevice.device_name);
    });

    it('should reject duplicate plate number', async () => {
      const device = dataFactory.createDevice('e2e-employee-id-001');
      device.vehicle_plate_num = 'E2E-1111';

      const response = await authHelper
        .authenticatedRequest(adminToken)
        .post('/devices')
        .send(device);

      expect([400, 409]).toContain(response.status);
    });

    it('should reject non-existent employee', async () => {
      const device = dataFactory.createDevice('nonexistent-employee');

      const response = await authHelper
        .authenticatedRequest(adminToken)
        .post('/devices')
        .send(device);

      expect([400, 404]).toContain(response.status);
    });
  });

  describe('/device/:id (PUT/PATCH)', () => {
    it('should update device', async () => {
      const updateData = {
        device_name: 'Updated Device Name',
      };

      const patchResponse = await authHelper
        .authenticatedRequest(adminToken)
        .patch('/device/e2e-device-id-001')
        .send(updateData);

      if (patchResponse.status === 404) {
        const putResponse = await authHelper
          .authenticatedRequest(adminToken)
          .put('/device/e2e-device-id-001')
          .send(updateData);
        expect([200, 201]).toContain(putResponse.status);
      } else {
        expect([200, 201]).toContain(patchResponse.status);
      }
    });

    it('should return 404 for non-existent device', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .patch('/device/nonexistent-id')
        .send({ device_name: 'Test' });

      expect(response.status).toBe(404);
    });
  });

  describe('/device/:id (DELETE)', () => {
    it('should delete device', async () => {
      const newDevice = dataFactory.createDevice('e2e-employee-id-001');
      const createResponse = await authHelper
        .authenticatedRequest(adminToken)
        .post('/devices')
        .send(newDevice);

      const deviceId = createResponse.body.device_id;

      const deleteResponse = await authHelper
        .authenticatedRequest(adminToken)
        .delete(`/device/${deviceId}`);

      expect([200, 204]).toContain(deleteResponse.status);
    });

    it('should return 404 for non-existent device', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .delete('/device/nonexistent-id');

      expect(response.status).toBe(404);
    });
  });

  describe('/device/available (GET)', () => {
    it('should return available devices', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/device/available');

      expect(response.status).toBe(200);
    });
  });

  describe('/device/by-plate/:plateNumber (GET)', () => {
    it('should return device by plate number', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/device/by-plate/E2E-1111');

      expect(response.status).toBe(200);
    });

    it('should return 404 for non-existent plate', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/device/by-plate/NOTEXIST');

      expect(response.status).toBe(404);
    });
  });
});
