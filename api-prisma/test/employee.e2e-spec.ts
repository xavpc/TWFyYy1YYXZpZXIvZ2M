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

describe('EmployeeController (e2e)', () => {
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

  describe('/employee (GET)', () => {
    it('should return all employees', async () => {
      const response = await authHelper.authenticatedRequest(adminToken).get('/employees');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body) || response.body.data).toBe(true);
    });

    it('should reject unauthenticated request', async () => {
      const response = await authHelper.unauthenticatedRequest().get('/employees');

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('/employee/:id (GET)', () => {
    it('should return employee by ID', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/employee/e2e-employee-id-001');

      expect(response.status).toBe(200);
      expect(response.body.employee_id).toBe('e2e-employee-id-001');
    });

    it('should return 404 for non-existent employee', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/employee/nonexistent-id');

      expect(response.status).toBe(404);
    });
  });

  describe('/employee (POST)', () => {
    it('should create new employee', async () => {
      const newEmployee = dataFactory.createEmployee();

      const response = await authHelper
        .authenticatedRequest(adminToken)
        .post('/employees')
        .send(newEmployee);

      expect([200, 201]).toContain(response.status);
      expect(response.body.first_name).toBe(newEmployee.first_name);
    });

    it('should reject duplicate email', async () => {
      const employee = dataFactory.createEmployee();
      employee.email = 'e2e.employee@test.com';

      const response = await authHelper
        .authenticatedRequest(adminToken)
        .post('/employees')
        .send(employee);

      expect([400, 409]).toContain(response.status);
    });

    it('should validate required fields', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .post('/employees')
        .send({
          first_name: 'Only First Name',
        });

      expect([400, 422]).toContain(response.status);
    });
  });

  describe('/employee/:id (PUT/PATCH)', () => {
    it('should update employee', async () => {
      const updateData = {
        first_name: 'Updated Name',
      };

      const patchResponse = await authHelper
        .authenticatedRequest(adminToken)
        .patch('/employee/e2e-employee-id-001')
        .send(updateData);

      if (patchResponse.status === 404) {
        const putResponse = await authHelper
          .authenticatedRequest(adminToken)
          .put('/employee/e2e-employee-id-001')
          .send(updateData);
        expect([200, 201]).toContain(putResponse.status);
      } else {
        expect([200, 201]).toContain(patchResponse.status);
      }
    });

    it('should return 404 for non-existent employee', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .patch('/employee/nonexistent-id')
        .send({ first_name: 'Test' });

      expect(response.status).toBe(404);
    });
  });

  describe('/employee/:id (DELETE)', () => {
    it('should delete employee', async () => {
      // Create an employee to delete
      const newEmployee = dataFactory.createEmployee();
      const createResponse = await authHelper
        .authenticatedRequest(adminToken)
        .post('/employees')
        .send(newEmployee);

      const employeeId = createResponse.body.employee_id;

      const deleteResponse = await authHelper
        .authenticatedRequest(adminToken)
        .delete(`/employee/${employeeId}`);

      expect([200, 204]).toContain(deleteResponse.status);
    });

    it('should return 404 for non-existent employee', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .delete('/employee/nonexistent-id');

      expect(response.status).toBe(404);
    });
  });

  describe('/employee/search (GET)', () => {
    it('should search employees by name', async () => {
      const response = await authHelper
        .authenticatedRequest(adminToken)
        .get('/employee/search?query=E2E');

      expect(response.status).toBe(200);
    });
  });
});
