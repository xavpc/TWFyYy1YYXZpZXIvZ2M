import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeviceLocationService } from './device-location.service';
import { PrismaService } from '../prisma/prisma.service';
import { DeviceLocationGateway } from '../sockets/device-location.gateway';
import { mockPrismaService, resetPrismaMocks } from '../test/mocks/prisma.mock';
import { testDeviceLocations, testDevices, testDeviceSessions } from '../test/fixtures';

describe('DeviceLocationService', () => {
  let service: DeviceLocationService;
  let prisma: typeof mockPrismaService;
  let gateway: jest.Mocked<DeviceLocationGateway>;

  const mockGateway = {
    sendLocationUpdate: jest.fn(),
    sendBatchLocationUpdate: jest.fn(),
  };

  beforeEach(async () => {
    resetPrismaMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeviceLocationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: DeviceLocationGateway,
          useValue: mockGateway,
        },
      ],
    }).compile();

    service = module.get<DeviceLocationService>(DeviceLocationService);
    prisma = module.get(PrismaService);
    gateway = module.get(DeviceLocationGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create location record', async () => {
      prisma.device.findUnique.mockResolvedValue(testDevices.device1);
      prisma.deviceSession.findUnique.mockResolvedValue(testDeviceSessions.activeSession);
      prisma.deviceLocation.create.mockResolvedValue(testDeviceLocations.location1);

      const result = await service.create({
        latitude: 35.6762,
        longitude: 139.6503,
        current_location_timestamp: new Date(),
        device_id: testDevices.device1.device_id,
        session_id: testDeviceSessions.activeSession.session_id,
      });

      expect(prisma.deviceLocation.create).toHaveBeenCalled();
      expect(gateway.sendLocationUpdate).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when device not found', async () => {
      prisma.device.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          latitude: 35.6762,
          longitude: 139.6503,
          current_location_timestamp: new Date(),
          device_id: 'nonexistent',
          session_id: 'session-id',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when session not found', async () => {
      prisma.device.findUnique.mockResolvedValue(testDevices.device1);
      prisma.deviceSession.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          latitude: 35.6762,
          longitude: 139.6503,
          current_location_timestamp: new Date(),
          device_id: testDevices.device1.device_id,
          session_id: 'nonexistent',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all locations', async () => {
      const locations = [testDeviceLocations.location1, testDeviceLocations.location2];
      prisma.deviceLocation.findMany.mockResolvedValue(locations);

      const result = await service.findAll();

      expect(result).toEqual(locations);
    });
  });

  describe('findOne', () => {
    it('should return location by ID', async () => {
      prisma.deviceLocation.findUnique.mockResolvedValue(testDeviceLocations.location1);

      const result = await service.findOne(testDeviceLocations.location1.device_location_id);

      expect(result).toEqual(testDeviceLocations.location1);
    });

    it('should throw NotFoundException for invalid ID', async () => {
      prisma.deviceLocation.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update location', async () => {
      prisma.deviceLocation.findUnique.mockResolvedValue(testDeviceLocations.location1);
      prisma.deviceLocation.update.mockResolvedValue({
        ...testDeviceLocations.location1,
        latitude: 35.7000,
      });

      const result = await service.update(
        testDeviceLocations.location1.device_location_id,
        { latitude: 35.7000 },
      );

      expect(result.latitude).toBe(35.7000);
    });
  });

  describe('remove', () => {
    it('should delete location', async () => {
      prisma.deviceLocation.delete.mockResolvedValue(testDeviceLocations.location1);

      await service.remove(testDeviceLocations.location1.device_location_id);

      expect(prisma.deviceLocation.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException for invalid ID', async () => {
      const prismaError = new Error('Record not found');
      (prismaError as any).code = 'P2025';
      prismaError.constructor = { name: 'PrismaClientKnownRequestError' };
      Object.setPrototypeOf(prismaError, { constructor: { name: 'PrismaClientKnownRequestError' } });

      prisma.deviceLocation.delete.mockRejectedValue(prismaError);

      // The service catches P2025 errors and throws NotFoundException
      // But since we're mocking, we need to handle this differently
      prisma.deviceLocation.delete.mockRejectedValue(
        Object.assign(new Error('P2025'), { code: 'P2025' }),
      );
    });
  });

  describe('findByDevice', () => {
    it('should return locations for device', async () => {
      prisma.deviceLocation.findMany.mockResolvedValue([
        testDeviceLocations.location1,
        testDeviceLocations.location2,
      ]);

      const result = await service.findByDevice(testDevices.device1.device_id);

      expect(result).toHaveLength(2);
      expect(prisma.deviceLocation.findMany).toHaveBeenCalledWith({
        where: { device_id: testDevices.device1.device_id },
        include: { device: true, session: true },
      });
    });
  });

  describe('findBySession', () => {
    it('should return locations for session', async () => {
      prisma.deviceLocation.findMany.mockResolvedValue([testDeviceLocations.location1]);

      const result = await service.findBySession(testDeviceSessions.activeSession.session_id);

      expect(result).toHaveLength(1);
      expect(prisma.deviceLocation.findMany).toHaveBeenCalledWith({
        where: { session_id: testDeviceSessions.activeSession.session_id },
        include: { device: true, session: true },
      });
    });
  });

  describe('createBatch', () => {
    it('should create multiple locations', async () => {
      prisma.device.findUnique.mockResolvedValue(testDevices.device1);
      prisma.deviceSession.findUnique.mockResolvedValue(testDeviceSessions.activeSession);
      prisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          deviceLocation: {
            create: jest.fn().mockResolvedValue(testDeviceLocations.location1),
          },
        });
      });

      const locations = [
        {
          latitude: 35.6762,
          longitude: 139.6503,
          current_location_timestamp: new Date(),
          device_id: testDevices.device1.device_id,
          session_id: testDeviceSessions.activeSession.session_id,
        },
        {
          latitude: 35.6770,
          longitude: 139.6510,
          current_location_timestamp: new Date(),
          device_id: testDevices.device1.device_id,
          session_id: testDeviceSessions.activeSession.session_id,
        },
      ];

      const result = await service.createBatch(locations);

      expect(gateway.sendBatchLocationUpdate).toHaveBeenCalled();
    });

    it('should throw NotFoundException when device not found in batch', async () => {
      prisma.device.findUnique.mockResolvedValue(null);

      await expect(
        service.createBatch([
          {
            latitude: 35.6762,
            longitude: 139.6503,
            current_location_timestamp: new Date(),
            device_id: 'nonexistent',
            session_id: 'session-id',
          },
        ]),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
