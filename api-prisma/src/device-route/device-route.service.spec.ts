import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DeviceRouteService } from './device-route.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrismaService, resetPrismaMocks } from '../test/mocks/prisma.mock';
import { testDeviceRoutes, testDevices, testRoutes, createDTOs } from '../test/fixtures';

describe('DeviceRouteService', () => {
  let service: DeviceRouteService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    resetPrismaMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeviceRouteService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DeviceRouteService>(DeviceRouteService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create device-route assignment', async () => {
      prisma.device.findUnique.mockResolvedValue(testDevices.device1);
      prisma.route.findUnique.mockResolvedValue(testRoutes.routeA);
      prisma.deviceRoute.create.mockResolvedValue(testDeviceRoutes.deviceRoute1);

      const result = await service.create(createDTOs.createDeviceRoute);

      expect(prisma.deviceRoute.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when device not found', async () => {
      prisma.device.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          ...createDTOs.createDeviceRoute,
          device_id: 'nonexistent',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when route not found', async () => {
      prisma.device.findUnique.mockResolvedValue(testDevices.device1);
      prisma.route.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          ...createDTOs.createDeviceRoute,
          route_id: 'nonexistent',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException for duplicate assignment', async () => {
      prisma.device.findUnique.mockResolvedValue(testDevices.device1);
      prisma.route.findUnique.mockResolvedValue(testRoutes.routeA);

      const prismaError = new Error('Unique constraint violation');
      (prismaError as any).code = 'P2002';
      prisma.deviceRoute.create.mockRejectedValue(prismaError);

      await expect(service.create(createDTOs.createDeviceRoute)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all assignments', async () => {
      const assignments = [testDeviceRoutes.deviceRoute1, testDeviceRoutes.deviceRoute2];
      prisma.deviceRoute.findMany.mockResolvedValue(assignments);

      const result = await service.findAll();

      expect(result).toEqual(assignments);
    });
  });

  describe('findOne', () => {
    it('should return assignment by ID', async () => {
      prisma.deviceRoute.findUnique.mockResolvedValue(testDeviceRoutes.deviceRoute1);

      const result = await service.findOne(testDeviceRoutes.deviceRoute1.device_route_id);

      expect(result).toEqual(testDeviceRoutes.deviceRoute1);
    });

    it('should throw NotFoundException for invalid ID', async () => {
      prisma.deviceRoute.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update assignment', async () => {
      prisma.deviceRoute.findUnique.mockResolvedValue(testDeviceRoutes.deviceRoute1);
      prisma.deviceRoute.update.mockResolvedValue({
        ...testDeviceRoutes.deviceRoute1,
        day_assigned: 'tuesday',
      });

      const result = await service.update(
        testDeviceRoutes.deviceRoute1.device_route_id,
        { day_assigned: 'tuesday' },
      );

      expect(result.day_assigned).toBe('tuesday');
    });
  });

  describe('remove', () => {
    it('should delete assignment', async () => {
      prisma.deviceRoute.delete.mockResolvedValue(testDeviceRoutes.deviceRoute1);

      await service.remove(testDeviceRoutes.deviceRoute1.device_route_id);

      expect(prisma.deviceRoute.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException for invalid ID', async () => {
      const prismaError = new Error('Record not found');
      (prismaError as any).code = 'P2025';
      prisma.deviceRoute.delete.mockRejectedValue(prismaError);

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByDevice', () => {
    it('should return routes for device', async () => {
      const routes = [testDeviceRoutes.deviceRoute1, testDeviceRoutes.deviceRoute2];
      prisma.deviceRoute.findMany.mockResolvedValue(routes);

      const result = await service.findByDevice(testDevices.device1.device_id);

      expect(result).toHaveLength(2);
    });
  });

  describe('findByRoute', () => {
    it('should return devices for route', async () => {
      const assignments = [testDeviceRoutes.deviceRoute1];
      prisma.deviceRoute.findMany.mockResolvedValue(assignments);

      const result = await service.findByRoute(testRoutes.routeA.route_id);

      expect(result).toHaveLength(1);
    });

    it('should group by device when requested', async () => {
      const assignments = [
        { ...testDeviceRoutes.deviceRoute1, day_assigned: 'monday' },
        { ...testDeviceRoutes.deviceRoute2, device_id: testDeviceRoutes.deviceRoute1.device_id, day_assigned: 'wednesday' },
      ];
      prisma.deviceRoute.findMany.mockResolvedValue(assignments);

      const result = await service.findByRoute(testRoutes.routeA.route_id, true);

      // Should group same device with multiple days
      expect(result).toBeDefined();
    });
  });

  describe('removeAllByRouteId', () => {
    it('should delete all assignments for route', async () => {
      prisma.route.findUnique.mockResolvedValue(testRoutes.routeA);
      prisma.deviceRoute.deleteMany.mockResolvedValue({ count: 3 });

      const result = await service.removeAllByRouteId(testRoutes.routeA.route_id);

      expect(result.affected).toBe(3);
    });

    it('should throw NotFoundException when route not found', async () => {
      prisma.route.findUnique.mockResolvedValue(null);

      await expect(service.removeAllByRouteId('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeAllByDeviceId', () => {
    it('should delete all assignments for device', async () => {
      prisma.device.findUnique.mockResolvedValue(testDevices.device1);
      prisma.deviceRoute.deleteMany.mockResolvedValue({ count: 2 });

      const result = await service.removeAllByDeviceId(testDevices.device1.device_id);

      expect(result.affected).toBe(2);
    });

    it('should throw NotFoundException when device not found', async () => {
      prisma.device.findUnique.mockResolvedValue(null);

      await expect(service.removeAllByDeviceId('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
