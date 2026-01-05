import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeviceSessionController } from './device-session.controller';
import { DeviceSessionService } from './device-session.service';
import { testDeviceSessions, createDTOs } from '../test/fixtures';

describe('DeviceSessionController', () => {
  let controller: DeviceSessionController;
  let service: jest.Mocked<DeviceSessionService>;

  const mockDeviceSessionService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findActiveSessions: jest.fn(),
    findByDeviceId: jest.fn(),
    findActiveSessionByDeviceId: jest.fn(),
    findSessionsByRouteAndDate: jest.fn(),
    findSessionsByDate: jest.fn(),
    findByDeviceRoute: jest.fn(),
    update: jest.fn(),
    endSession: jest.fn(),
    endActiveSessionByDeviceId: jest.fn(),
    remove: jest.fn(),
    removeAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeviceSessionController],
      providers: [
        {
          provide: DeviceSessionService,
          useValue: mockDeviceSessionService,
        },
      ],
    }).compile();

    controller = module.get<DeviceSessionController>(DeviceSessionController);
    service = module.get(DeviceSessionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a device session and return success response', async () => {
      const createDto = createDTOs.createDeviceSession;
      mockDeviceSessionService.create.mockResolvedValue(testDeviceSessions.activeSession);

      const result = await controller.create(createDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Device session created successfully');
      expect(result.data).toEqual(testDeviceSessions.activeSession);
    });
  });

  describe('findAll', () => {
    it('should return all sessions with pagination', async () => {
      const sessions = [testDeviceSessions.activeSession, testDeviceSessions.completedSession];
      mockDeviceSessionService.findAll.mockResolvedValue({
        data: sessions,
        total: 2,
      });

      const result = await controller.findAll({});

      expect(result.success).toBe(true);
      expect(result.message).toBe('Device sessions retrieved successfully');
      expect(result.total).toBe(2);
    });
  });

  describe('findActiveSessions', () => {
    it('should return all active sessions', async () => {
      mockDeviceSessionService.findActiveSessions.mockResolvedValue([testDeviceSessions.activeSession]);

      const result = await controller.findActiveSessions();

      expect(result.success).toBe(true);
      expect(result.message).toBe('Active device sessions retrieved successfully');
      expect(result.total).toBe(1);
    });
  });

  describe('findByDeviceId', () => {
    it('should return sessions for a specific device', async () => {
      mockDeviceSessionService.findByDeviceId.mockResolvedValue([testDeviceSessions.activeSession]);

      const result = await controller.findByDeviceId('device-id', 'false');

      expect(service.findByDeviceId).toHaveBeenCalledWith('device-id', false);
      expect(result.success).toBe(true);
      expect(result.total).toBe(1);
    });
  });

  describe('findActiveSessionByDeviceId', () => {
    it('should return active session for a device', async () => {
      mockDeviceSessionService.findActiveSessionByDeviceId.mockResolvedValue(testDeviceSessions.activeSession);

      const result = await controller.findActiveSessionByDeviceId('device-id');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(testDeviceSessions.activeSession);
    });

    it('should throw NotFoundException when no active session found', async () => {
      mockDeviceSessionService.findActiveSessionByDeviceId.mockResolvedValue(null);

      await expect(controller.findActiveSessionByDeviceId('device-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findSessionsByRouteAndDate', () => {
    it('should return sessions by route and date', async () => {
      mockDeviceSessionService.findSessionsByRouteAndDate.mockResolvedValue([testDeviceSessions.activeSession]);

      const result = await controller.findSessionsByRouteAndDate('route-id', '2024-01-01', 'device-id', 'false');

      expect(result.success).toBe(true);
      expect(result.total).toBe(1);
    });
  });

  describe('findSessionsByDate', () => {
    it('should return sessions by date', async () => {
      mockDeviceSessionService.findSessionsByDate.mockResolvedValue([testDeviceSessions.activeSession]);

      const result = await controller.findSessionsByDate('2024-01-01', 'device-id', 'false');

      expect(result.success).toBe(true);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a session by ID', async () => {
      mockDeviceSessionService.findOne.mockResolvedValue(testDeviceSessions.activeSession);

      const result = await controller.findOne(testDeviceSessions.activeSession.session_id);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Device session retrieved successfully');
      expect(result.data).toEqual(testDeviceSessions.activeSession);
    });
  });

  describe('findByRoute', () => {
    it('should return sessions for a device route', async () => {
      mockDeviceSessionService.findByDeviceRoute.mockResolvedValue([testDeviceSessions.activeSession]);

      const result = await controller.findByRoute('device-route-id', 'device-id', 'true');

      expect(service.findByDeviceRoute).toHaveBeenCalledWith('device-route-id', 'device-id', true);
      expect(result.success).toBe(true);
      expect(result.total).toBe(1);
    });
  });

  describe('update', () => {
    it('should update a session and return success response', async () => {
      const updateDto = { device_route_id: 'updated-route-id' };
      mockDeviceSessionService.update.mockResolvedValue({
        ...testDeviceSessions.activeSession,
        ...updateDto,
      });

      const result = await controller.update(testDeviceSessions.activeSession.session_id, updateDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Device session updated successfully');
    });
  });

  describe('endSession', () => {
    it('should end a session and return success response', async () => {
      mockDeviceSessionService.endSession.mockResolvedValue({
        ...testDeviceSessions.activeSession,
        end: new Date(),
      });

      const result = await controller.endSession(testDeviceSessions.activeSession.session_id);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Device session ended successfully');
    });
  });

  describe('endActiveSessionByDeviceId', () => {
    it('should end active session for a device', async () => {
      mockDeviceSessionService.endActiveSessionByDeviceId.mockResolvedValue({
        ...testDeviceSessions.activeSession,
        end: new Date(),
      });

      const result = await controller.endActiveSessionByDeviceId('device-id');

      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException when no active session found', async () => {
      mockDeviceSessionService.endActiveSessionByDeviceId.mockResolvedValue(null);

      await expect(controller.endActiveSessionByDeviceId('device-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a session and return success response', async () => {
      mockDeviceSessionService.remove.mockResolvedValue(testDeviceSessions.activeSession);

      const result = await controller.remove(testDeviceSessions.activeSession.session_id);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Device session removed successfully');
    });
  });

  describe('removeAll', () => {
    it('should remove all sessions', async () => {
      mockDeviceSessionService.removeAll.mockResolvedValue({ count: 5 });

      const result = await controller.removeAll();

      expect(result.success).toBe(true);
      expect(result.message).toBe('All device sessions removed successfully');
      expect(result.count).toBe(5);
    });
  });
});
