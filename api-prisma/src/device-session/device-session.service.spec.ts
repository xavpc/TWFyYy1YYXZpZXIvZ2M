import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeviceSessionService } from './device-session.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrismaService, resetPrismaMocks } from '../test/mocks/prisma.mock';
import { testDeviceSessions, testDeviceRoutes } from '../test/fixtures';

describe('DeviceSessionService', () => {
  let service: DeviceSessionService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    resetPrismaMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeviceSessionService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DeviceSessionService>(DeviceSessionService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create session', async () => {
      prisma.deviceRoute.findUnique.mockResolvedValue(testDeviceRoutes.deviceRoute1);
      prisma.deviceSession.create.mockResolvedValue(testDeviceSessions.activeSession);

      const result = await service.create({
        device_route_id: testDeviceRoutes.deviceRoute1.device_route_id,
      });

      expect(prisma.deviceSession.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            device_route_id: testDeviceRoutes.deviceRoute1.device_route_id,
          }),
        }),
      );
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when device route not found', async () => {
      prisma.deviceRoute.findUnique.mockResolvedValue(null);

      await expect(
        service.create({ device_route_id: 'nonexistent' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all sessions without filter', async () => {
      const sessions = [testDeviceSessions.activeSession, testDeviceSessions.completedSession];
      prisma.deviceSession.findMany.mockResolvedValue(sessions);

      const result = await service.findAll();

      expect(result.data).toEqual(sessions);
      expect(result.total).toBe(sessions.length);
    });

    it('should filter by date range', async () => {
      prisma.deviceSession.findMany.mockResolvedValue([testDeviceSessions.completedSession]);
      prisma.deviceSession.count.mockResolvedValue(1);

      await service.findAll({
        start_date: '2024-01-01',
        end_date: '2024-01-31',
      });

      expect(prisma.deviceSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            start: expect.any(Object),
          }),
        }),
      );
    });

    it('should filter by active status', async () => {
      prisma.deviceSession.findMany.mockResolvedValue([testDeviceSessions.activeSession]);
      prisma.deviceSession.count.mockResolvedValue(1);

      await service.findAll({ is_active: true });

      expect(prisma.deviceSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            end: null,
          }),
        }),
      );
    });

    it('should apply global search', async () => {
      prisma.deviceSession.findMany.mockResolvedValue([]);
      prisma.deviceSession.count.mockResolvedValue(0);

      await service.findAll({ search: 'Truck' });

      expect(prisma.deviceSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return session by ID', async () => {
      prisma.deviceSession.findUnique.mockResolvedValue(testDeviceSessions.activeSession);

      const result = await service.findOne(testDeviceSessions.activeSession.session_id);

      expect(result).toEqual(testDeviceSessions.activeSession);
    });

    it('should throw NotFoundException for invalid ID', async () => {
      prisma.deviceSession.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByDeviceId', () => {
    it('should return sessions for device', async () => {
      prisma.deviceSession.findMany.mockResolvedValue([testDeviceSessions.activeSession]);

      const result = await service.findByDeviceId('device-id', true);

      expect(result).toHaveLength(1);
      expect(prisma.deviceSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            device_route: { device_id: 'device-id' },
            end: null,
          }),
        }),
      );
    });
  });

  describe('findActiveSessionByDeviceId', () => {
    it('should return active session', async () => {
      prisma.deviceSession.findFirst.mockResolvedValue(testDeviceSessions.activeSession);

      const result = await service.findActiveSessionByDeviceId('device-id');

      expect(result).toEqual(testDeviceSessions.activeSession);
    });

    it('should return null when no active session', async () => {
      prisma.deviceSession.findFirst.mockResolvedValue(null);

      const result = await service.findActiveSessionByDeviceId('device-id');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update session', async () => {
      prisma.deviceSession.findUnique.mockResolvedValue(testDeviceSessions.activeSession);
      prisma.deviceSession.update.mockResolvedValue({
        ...testDeviceSessions.activeSession,
        end: new Date(),
      });

      const result = await service.update(
        testDeviceSessions.activeSession.session_id,
        { end: new Date() },
      );

      expect(result.end).toBeDefined();
    });
  });

  describe('endSession', () => {
    it('should set session_end', async () => {
      prisma.deviceSession.findUnique.mockResolvedValue(testDeviceSessions.activeSession);
      prisma.deviceSession.update.mockResolvedValue({
        ...testDeviceSessions.activeSession,
        end: new Date(),
      });

      const result = await service.endSession(testDeviceSessions.activeSession.session_id);

      expect(result.end).toBeDefined();
    });

    it('should throw when session already ended', async () => {
      prisma.deviceSession.findUnique.mockResolvedValue(testDeviceSessions.completedSession);

      await expect(
        service.endSession(testDeviceSessions.completedSession.session_id),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('endActiveSessionByDeviceId', () => {
    it('should end active session', async () => {
      prisma.deviceSession.findFirst.mockResolvedValue(testDeviceSessions.activeSession);
      prisma.deviceSession.update.mockResolvedValue({
        ...testDeviceSessions.activeSession,
        end: new Date(),
      });

      const result = await service.endActiveSessionByDeviceId('device-id');

      expect(result?.end).toBeDefined();
    });

    it('should return null when no active session', async () => {
      prisma.deviceSession.findFirst.mockResolvedValue(null);

      const result = await service.endActiveSessionByDeviceId('device-id');

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete session', async () => {
      prisma.deviceSession.findUnique.mockResolvedValue(testDeviceSessions.activeSession);
      prisma.deviceSession.delete.mockResolvedValue(testDeviceSessions.activeSession);

      await service.remove(testDeviceSessions.activeSession.session_id);

      expect(prisma.deviceSession.delete).toHaveBeenCalled();
    });
  });

  describe('findActiveSessions', () => {
    it('should return all active sessions', async () => {
      prisma.deviceSession.findMany.mockResolvedValue([testDeviceSessions.activeSession]);

      const result = await service.findActiveSessions();

      expect(result).toHaveLength(1);
      expect(prisma.deviceSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { end: null },
        }),
      );
    });
  });

  describe('findSessionsByDate', () => {
    it('should return sessions for date', async () => {
      prisma.deviceSession.findMany.mockResolvedValue([testDeviceSessions.completedSession]);

      const result = await service.findSessionsByDate(new Date('2024-01-14'));

      expect(result).toHaveLength(1);
    });
  });

  describe('findByDeviceRoute', () => {
    it('should return sessions by device route', async () => {
      prisma.deviceSession.findMany.mockResolvedValue([testDeviceSessions.activeSession]);

      const result = await service.findByDeviceRoute('device-route-id');

      expect(result).toHaveLength(1);
    });
  });

  describe('findSessionsByRouteAndDate', () => {
    it('should filter by both route and date', async () => {
      prisma.deviceSession.findMany.mockResolvedValue([testDeviceSessions.completedSession]);

      const result = await service.findSessionsByRouteAndDate(
        'device-route-id',
        new Date('2024-01-14'),
      );

      expect(result).toHaveLength(1);
    });
  });

  describe('removeAll', () => {
    it('should delete all sessions', async () => {
      prisma.deviceSession.deleteMany.mockResolvedValue({ count: 5 });

      const result = await service.removeAll();

      expect(result.count).toBe(5);
    });
  });

  describe('findRecentlyEndedSessions', () => {
    it('should find sessions ended within lookback period', async () => {
      prisma.deviceSession.findMany.mockResolvedValue([testDeviceSessions.completedSession]);

      const result = await service.findRecentlyEndedSessions(24);

      expect(result).toHaveLength(1);
      expect(prisma.deviceSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            end: expect.objectContaining({
              not: null,
              gte: expect.any(Date),
            }),
          }),
        }),
      );
    });
  });

  describe('sessionHasReport', () => {
    it('should return true when session has report', async () => {
      prisma.reports.count.mockResolvedValue(1);

      const result = await service.sessionHasReport('session-id');

      expect(result).toBe(true);
    });

    it('should return false when session has no report', async () => {
      prisma.reports.count.mockResolvedValue(0);

      const result = await service.sessionHasReport('session-id');

      expect(result).toBe(false);
    });
  });
});
