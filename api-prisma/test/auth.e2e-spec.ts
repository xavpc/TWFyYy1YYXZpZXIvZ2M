import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupE2ETest,
  teardownE2ETest,
  cleanupDatabase,
  seedTestData,
  E2ETestContext,
  E2EAuthHelper,
} from '../src/test/e2e-setup';

describe('AuthController (e2e)', () => {
  let context: E2ETestContext;
  let app: INestApplication;
  let authHelper: E2EAuthHelper;
  const apiKey = process.env.API_KEY || 'test-api-key';

  beforeAll(async () => {
    context = await setupE2ETest();
    app = context.app;
    authHelper = new E2EAuthHelper(app, apiKey);
    await cleanupDatabase(context.prisma);
    await seedTestData(context.prisma);
  });

  afterAll(async () => {
    await cleanupDatabase(context.prisma);
    await teardownE2ETest(context);
  });

  describe('/auth/login (POST)', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .set('x-api-key', apiKey)
        .send({
          username: 'e2e_admin',
          password: 'TestPassword123!',
        });

      expect([200, 201]).toContain(response.status);
      expect(response.body).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .set('x-api-key', apiKey)
        .send({
          username: 'e2e_admin',
          password: 'WrongPassword',
        });

      expect([400, 401]).toContain(response.status);
    });

    it('should reject login without API key', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'e2e_admin',
          password: 'TestPassword123!',
        });

      expect([401, 403]).toContain(response.status);
    });

    it('should reject non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .set('x-api-key', apiKey)
        .send({
          username: 'nonexistent_user',
          password: 'TestPassword123!',
        });

      expect([400, 401, 404]).toContain(response.status);
    });
  });

  describe('/auth/logout (POST)', () => {
    it('should logout authenticated user', async () => {
      const token = await authHelper.login('e2e_admin', 'TestPassword123!');

      const response = await authHelper.authenticatedRequest(token).post('/auth/logout');

      expect([200, 201, 204]).toContain(response.status);
    });

    it('should reject logout without token', async () => {
      const response = await authHelper.unauthenticatedRequest().post('/auth/logout');

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('/auth/profile (GET)', () => {
    it('should return user profile', async () => {
      const token = await authHelper.login('e2e_admin', 'TestPassword123!');

      const response = await authHelper.authenticatedRequest(token).get('/auth/profile');

      expect([200, 201]).toContain(response.status);
      expect(response.body).toBeDefined();
    });

    it('should reject unauthenticated request', async () => {
      const response = await authHelper.unauthenticatedRequest().get('/auth/profile');

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('/auth/register (POST)', () => {
    it('should register new user as admin', async () => {
      const token = await authHelper.login('e2e_admin', 'TestPassword123!');

      const response = await authHelper
        .authenticatedRequest(token)
        .post('/auth/register')
        .send({
          username: `e2e_new_user_${Date.now()}`,
          password: 'NewPassword123!',
          role: 'garbage_collector',
        });

      expect([200, 201]).toContain(response.status);
    });

    it('should reject registration without admin token', async () => {
      const token = await authHelper.login('e2e_collector', 'TestPassword123!');

      const response = await authHelper
        .authenticatedRequest(token)
        .post('/auth/register')
        .send({
          username: `e2e_unauthorized_${Date.now()}`,
          password: 'NewPassword123!',
          role: 'admin',
        });

      expect([401, 403]).toContain(response.status);
    });

    it('should reject duplicate username', async () => {
      const token = await authHelper.login('e2e_admin', 'TestPassword123!');

      const response = await authHelper
        .authenticatedRequest(token)
        .post('/auth/register')
        .send({
          username: 'e2e_admin',
          password: 'NewPassword123!',
          role: 'garbage_collector',
        });

      expect([400, 409]).toContain(response.status);
    });
  });

  describe('/auth/refresh (POST)', () => {
    it('should refresh token', async () => {
      const token = await authHelper.login('e2e_admin', 'TestPassword123!');

      const response = await authHelper.authenticatedRequest(token).post('/auth/refresh');

      expect([200, 201]).toContain(response.status);
    });
  });
});
