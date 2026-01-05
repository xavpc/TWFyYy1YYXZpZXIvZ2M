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

describe('ComplaintsController (e2e)', () => {
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

    // Create a test complaint
    await context.prisma.complaints.create({
      data: {
        complaint_id: 'e2e-complaint-id-001',
        title: 'E2E Test Complaint',
        description: 'This is a test complaint for E2E testing',
        latitude: 35.6762,
        longitude: 139.6503,
        complaint_timestamp: new Date(),
        image_id: 'e2e-image-id-001',
        device_id: 'e2e-device-id-001',
      },
    });
  });

  afterAll(async () => {
    await cleanupDatabase(context.prisma);
    await teardownE2ETest(context);
  });

  describe('/complaints (GET)', () => {
    it('should return all complaints', async () => {
      const response = await authHelper.authenticatedRequest(adminToken).get('/complaints');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body) || response.body.data).toBe(true);
    });

    it('should reject unauthenticated request', async () => {
      const response = await authHelper.unauthenticatedRequest().get('/complaints');

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('/complaints/:id (GET)', () => {
    it('should return complaint by ID', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/complaints/e2e-complaint-id-001');

      expect(response.status).toBe(200);
      expect(response.body.complaint_id).toBe('e2e-complaint-id-001');
    });

    it('should return 404 for non-existent complaint', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/complaints/nonexistent-id');

      expect(response.status).toBe(404);
    });
  });

  describe('/complaints (POST)', () => {
    it('should create new complaint', async () => {
      const newComplaint = dataFactory.createComplaint('e2e-image-id-001', 'e2e-device-id-001');

      const response = await authHelper
        .authenticatedRequest(adminToken)
        .post('/complaints')
        .send(newComplaint);

      expect([200, 201]).toContain(response.status);
      expect(response.body.title).toBe(newComplaint.title);
    });

    it('should reject duplicate title', async () => {
      const complaint = dataFactory.createComplaint('e2e-image-id-001', 'e2e-device-id-001');
      complaint.title = 'E2E Test Complaint';

      const response = await authHelper
        .authenticatedRequest(adminToken)
        .post('/complaints')
        .send(complaint);

      expect([400, 409]).toContain(response.status);
    });

    it('should reject non-existent image', async () => {
      const complaint = dataFactory.createComplaint('nonexistent-image', 'e2e-device-id-001');

      const response = await authHelper
        .authenticatedRequest(adminToken)
        .post('/complaints')
        .send(complaint);

      expect([400, 404]).toContain(response.status);
    });

    it('should reject non-existent device', async () => {
      const complaint = dataFactory.createComplaint('e2e-image-id-001', 'nonexistent-device');

      const response = await authHelper
        .authenticatedRequest(adminToken)
        .post('/complaints')
        .send(complaint);

      expect([400, 404]).toContain(response.status);
    });

    it('should validate coordinates', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .post('/complaints')
        .send({
          title: 'Invalid Coords Complaint',
          description: 'Description',
          latitude: 999,
          longitude: 999,
          complaint_timestamp: new Date().toISOString(),
          image_id: 'e2e-image-id-001',
          device_id: 'e2e-device-id-001',
        });

      expect([400, 422]).toContain(response.status);
    });
  });

  describe('/complaints/:id (PUT/PATCH)', () => {
    it('should update complaint', async () => {
      const updateData = {
        description: 'Updated description',
      };

      const patchResponse = await authHelper
        .authenticatedRequest(adminToken)
        .patch('/complaints/e2e-complaint-id-001')
        .send(updateData);

      if (patchResponse.status === 404) {
        const putResponse = await authHelper
          .authenticatedRequest(adminToken)
          .put('/complaints/e2e-complaint-id-001')
          .send(updateData);
        expect([200, 201]).toContain(putResponse.status);
      } else {
        expect([200, 201]).toContain(patchResponse.status);
      }
    });

    it('should return 404 for non-existent complaint', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .patch('/complaints/nonexistent-id')
        .send({ description: 'Test' });

      expect(response.status).toBe(404);
    });
  });

  describe('/complaints/:id (DELETE)', () => {
    it('should delete complaint', async () => {
      // Create a complaint to delete
      const complaint = dataFactory.createComplaint('e2e-image-id-001', 'e2e-device-id-001');
      const createResponse = await authHelper
        .authenticatedRequest(adminToken)
        .post('/complaints')
        .send(complaint);

      const complaintId = createResponse.body.complaint_id;

      const deleteResponse = await authHelper
        .authenticatedRequest(adminToken)
        .delete(`/complaints/${complaintId}`);

      expect([200, 204]).toContain(deleteResponse.status);
    });

    it('should return 404 for non-existent complaint', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .delete('/complaints/nonexistent-id');

      expect(response.status).toBe(404);
    });
  });
});
