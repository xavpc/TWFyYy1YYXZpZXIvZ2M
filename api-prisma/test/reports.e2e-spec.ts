import { INestApplication } from '@nestjs/common';
import {
  setupE2ETest,
  teardownE2ETest,
  cleanupDatabase,
  seedTestData,
  E2ETestContext,
  E2EAuthHelper,
} from '../src/test/e2e-setup';

describe('ReportsController (e2e)', () => {
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

    // Create a completed session for report testing
    const session = await context.prisma.deviceSession.create({
      data: {
        session_id: 'e2e-session-for-report',
        start: new Date(Date.now() - 3600000),
        end: new Date(),
        device_route_id: 'e2e-dr-id-001',
      },
    });
    sessionId = session.session_id;

    // Create a test report
    await context.prisma.reports.create({
      data: {
        report_id: 'e2e-report-id-001',
        route_name: 'E2E Test Route 1',
        employee_name: 'E2E Employee',
        vehicle_plate_number: 'E2E-1111',
        start_time: new Date(Date.now() - 3600000),
        end_time: new Date(),
        duration_minutes: 60,
        total_collection_points: 2,
        collected_points: 2,
        collection_percentage: 100,
        report_timestamp: new Date(),
        remarks: 'E2E Test Report',
        session_id: sessionId,
      },
    });
  });

  afterAll(async () => {
    await cleanupDatabase(context.prisma);
    await teardownE2ETest(context);
  });

  describe('/reports (GET)', () => {
    it('should return all reports', async () => {
      const response = await authHelper.authenticatedRequest(adminToken).get('/reports');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body) || response.body.data).toBe(true);
    });

    it('should reject unauthenticated request', async () => {
      const response = await authHelper.unauthenticatedRequest().get('/reports');

      expect([401, 403]).toContain(response.status);
    });

    it('should support pagination', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/reports?page=1&limit=10');

      expect(response.status).toBe(200);
    });

    it('should support search', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/reports?search=E2E');

      expect(response.status).toBe(200);
    });

    it('should support date range filter', async () => {
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get(
          `/reports?start_date=${weekAgo.toISOString().split('T')[0]}&end_date=${today.toISOString().split('T')[0]}`,
        );

      expect(response.status).toBe(200);
    });
  });

  describe('/reports/:id (GET)', () => {
    it('should return report by ID', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/reports/e2e-report-id-001');

      expect(response.status).toBe(200);
      expect(response.body.report_id).toBe('e2e-report-id-001');
    });

    it('should return 404 for non-existent report', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/reports/nonexistent-id');

      expect(response.status).toBe(404);
    });
  });

  describe('/reports (POST)', () => {
    it('should create new report from session', async () => {
      // Create another completed session
      const newSession = await context.prisma.deviceSession.create({
        data: {
          session_id: `e2e-session-new-${Date.now()}`,
          start: new Date(Date.now() - 7200000),
          end: new Date(),
          device_route_id: 'e2e-dr-id-002',
        },
      });

      const response = await authHelper
        .authenticatedRequest(adminToken)
        .post('/reports')
        .send({
          session_id: newSession.session_id,
          remarks: 'New E2E Test Report',
        });

      expect([200, 201]).toContain(response.status);
    });

    it('should reject non-existent session', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .post('/reports')
        .send({
          session_id: 'nonexistent-session',
          remarks: 'Test Report',
        });

      expect([400, 404]).toContain(response.status);
    });
  });

  describe('/reports/:id (PUT/PATCH)', () => {
    it('should update report remarks', async () => {
      const updateData = {
        remarks: 'Updated remarks',
      };

      const patchResponse = await authHelper
        .authenticatedRequest(adminToken)
        .patch('/reports/e2e-report-id-001')
        .send(updateData);

      if (patchResponse.status === 404) {
        const putResponse = await authHelper
          .authenticatedRequest(adminToken)
          .put('/reports/e2e-report-id-001')
          .send(updateData);
        expect([200, 201]).toContain(putResponse.status);
      } else {
        expect([200, 201]).toContain(patchResponse.status);
      }
    });
  });

  describe('/reports/:id (DELETE)', () => {
    it('should delete report', async () => {
      // Create a session and report to delete
      const newSession = await context.prisma.deviceSession.create({
        data: {
          session_id: `e2e-session-delete-${Date.now()}`,
          start: new Date(Date.now() - 3600000),
          end: new Date(),
          device_route_id: 'e2e-dr-id-001',
        },
      });

      const newReport = await context.prisma.reports.create({
        data: {
          report_id: `e2e-report-delete-${Date.now()}`,
          route_name: 'Delete Test Route',
          employee_name: 'Delete Employee',
          vehicle_plate_number: 'DEL-1111',
          start_time: new Date(Date.now() - 3600000),
          end_time: new Date(),
          duration_minutes: 60,
          total_collection_points: 1,
          collected_points: 1,
          collection_percentage: 100,
          report_timestamp: new Date(),
          remarks: 'To be deleted',
          session_id: newSession.session_id,
        },
      });

      const deleteResponse = await authHelper
        .authenticatedRequest(adminToken)
        .delete(`/reports/${newReport.report_id}`);

      expect([200, 204]).toContain(deleteResponse.status);
    });
  });

  describe('/reports/by-route/:routeName (GET)', () => {
    it('should return reports by route name', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/reports/by-route/E2E');

      expect(response.status).toBe(200);
    });
  });

  describe('/reports/by-employee/:employeeName (GET)', () => {
    it('should return reports by employee name', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/reports/by-employee/E2E');

      expect(response.status).toBe(200);
    });
  });

  describe('/reports/by-vehicle/:plateNumber (GET)', () => {
    it('should return reports by vehicle plate number', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/reports/by-vehicle/E2E');

      expect(response.status).toBe(200);
    });
  });

  describe('/reports/date-range (GET)', () => {
    it('should return reports within date range', async () => {
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get(
          `/reports/date-range?start=${weekAgo.toISOString()}&end=${today.toISOString()}`,
        );

      expect(response.status).toBe(200);
    });
  });

  describe('/reports/export/excel (GET)', () => {
    it('should export reports to Excel', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/reports/export/excel');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
    });
  });
});
