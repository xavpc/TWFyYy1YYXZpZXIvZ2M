import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ApiKeyGuard } from './guards/api-key.guard';
import { JwtAuthGuardv2 } from './guards/jwt.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = {
    login: jest.fn(),
    logout: jest.fn(),
    validateApiKey: jest.fn(),
    verifyPassword: jest.fn(),
  };

  const mockResponse = {
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
  } as any;

  const mockGuard = { canActivate: jest.fn().mockReturnValue(true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue(mockGuard)
      .overrideGuard(JwtAuthGuardv2)
      .useValue(mockGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login with correct parameters', async () => {
      const credentials = { username: 'testuser', password: 'password123' };
      const ip = '127.0.0.1';

      mockAuthService.login.mockResolvedValue(undefined);

      await controller.login(credentials, ip, mockResponse);

      expect(authService.login).toHaveBeenCalledWith(
        credentials.username,
        credentials.password,
        ip,
        mockResponse,
      );
    });

    it('should handle login with different credentials', async () => {
      const credentials = { username: 'admin', password: 'admin123' };
      const ip = '192.168.1.1';

      mockAuthService.login.mockResolvedValue(undefined);

      await controller.login(credentials, ip, mockResponse);

      expect(authService.login).toHaveBeenCalledWith(
        'admin',
        'admin123',
        '192.168.1.1',
        mockResponse,
      );
    });
  });

  describe('logout', () => {
    it('should call authService.logout with response object', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      await controller.logout(mockResponse);

      expect(authService.logout).toHaveBeenCalledWith(mockResponse);
    });
  });
});
