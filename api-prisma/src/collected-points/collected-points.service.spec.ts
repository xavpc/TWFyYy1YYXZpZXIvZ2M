import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CollectedPointsService } from './collected-points.service';
import { PrismaService } from '../prisma/prisma.service';
import { DeviceLocationGateway } from '../sockets/device-location.gateway';
import { mockPrismaService, resetPrismaMocks } from '../test/mocks/prisma.mock';
import { testCollectedPoints, testDevices, testCollectionPoints, testDeviceSessions, createDTOs } from '../test/fixtures';
import { Prisma } from '@prisma/client';

describe('CollectedPointsService', () => {
  let service: CollectedPointsService;
  let prisma: typeof mockPrismaService;

  const mockGateway = {
    sendCollectedUpdate: jest.fn(),
  };

  beforeEach(async () => {
    resetPrismaMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectedPointsService,
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

    service = module.get<CollectedPointsService>(CollectedPointsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create collection record', async () => {
      prisma.device.findUnique.mockResolvedValue(testDevices.device1);
      prisma.collectionPoints.findUnique.mockResolvedValue(testCollectionPoints.pointA1);
      prisma.deviceSession.findUnique.mockResolvedValue(testDeviceSessions.activeSession);
      prisma.collectedPoints.findFirst.mockResolvedValue(null);
      prisma.collectedPoints.create.mockResolvedValue({
        ...testCollectedPoints.collected1,
        collection_point: testCollectionPoints.pointA1,
      });

      const result = await service.create(createDTOs.createCollectedPoint);

      expect(prisma.collectedPoints.create).toHaveBeenCalled();
      expect(mockGateway.sendCollectedUpdate).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when device not found', async () => {
      prisma.device.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          ...createDTOs.createCollectedPoint,
          device_id: 'nonexistent',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when collection point not found', async () => {
      prisma.device.findUnique.mockResolvedValue(testDevices.device1);
      prisma.collectionPoints.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          ...createDTOs.createCollectedPoint,
          collection_point_id: 'nonexistent',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when session not found', async () => {
      prisma.device.findUnique.mockResolvedValue(testDevices.device1);
      prisma.collectionPoints.findUnique.mockResolvedValue(testCollectionPoints.pointA1);
      prisma.deviceSession.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          ...createDTOs.createCollectedPoint,
          session_id: 'nonexistent',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException for duplicate collection', async () => {
      prisma.device.findUnique.mockResolvedValue(testDevices.device1);
      prisma.collectionPoints.findUnique.mockResolvedValue(testCollectionPoints.pointA1);
      prisma.deviceSession.findUnique.mockResolvedValue(testDeviceSessions.activeSession);
      prisma.collectedPoints.findFirst.mockResolvedValue(testCollectedPoints.collected1);

      await expect(service.create(createDTOs.createCollectedPoint)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all records', async () => {
      const records = [testCollectedPoints.collected1, testCollectedPoints.collected2];
      prisma.collectedPoints.findMany.mockResolvedValue(records);

      const result = await service.findAll();

      expect(result).toEqual(records);
    });
  });

  describe('findOne', () => {
    it('should return record by ID', async () => {
      prisma.collectedPoints.findUnique.mockResolvedValue(testCollectedPoints.collected1);

      const result = await service.findOne(testCollectedPoints.collected1.collected_point_id);

      expect(result).toEqual(testCollectedPoints.collected1);
    });

    it('should throw NotFoundException for invalid ID', async () => {
      prisma.collectedPoints.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update record', async () => {
      prisma.collectedPoints.findUnique.mockResolvedValue(testCollectedPoints.collected1);
      prisma.collectedPoints.update.mockResolvedValue({
        ...testCollectedPoints.collected1,
        collected_timestamp: new Date(),
      });

      const result = await service.update(
        testCollectedPoints.collected1.collected_point_id,
        { collected_timestamp: new Date().toISOString() },
      );

      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should delete record', async () => {
      prisma.collectedPoints.delete.mockResolvedValue(testCollectedPoints.collected1);

      await service.remove(testCollectedPoints.collected1.collected_point_id);

      expect(prisma.collectedPoints.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException for invalid ID', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        { code: 'P2025', clientVersion: '5.0.0' }
      );
      prisma.collectedPoints.delete.mockRejectedValue(prismaError);

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByDevice', () => {
    it('should return records for device', async () => {
      const records = [testCollectedPoints.collected1, testCollectedPoints.collected2];
      prisma.collectedPoints.findMany.mockResolvedValue(records);

      const result = await service.findByDevice(testDevices.device1.device_id);

      expect(result).toHaveLength(2);
    });
  });

  describe('findBySession', () => {
    it('should return records for session', async () => {
      const records = [testCollectedPoints.collected1];
      prisma.collectedPoints.findMany.mockResolvedValue(records);

      const result = await service.findBySession(testDeviceSessions.completedSession.session_id);

      expect(result).toHaveLength(1);
    });
  });

  describe('isCollectionAlreadyCollected', () => {
    it('should return true when already collected', async () => {
      prisma.collectionPoints.findUnique.mockResolvedValue(testCollectionPoints.pointA1);
      prisma.deviceSession.findUnique.mockResolvedValue(testDeviceSessions.activeSession);
      prisma.collectedPoints.findFirst.mockResolvedValue(testCollectedPoints.collected1);

      const result = await service.isCollectionAlreadyCollected(
        testCollectionPoints.pointA1.collection_point_id,
        testDeviceSessions.activeSession.session_id,
      );

      expect(result).toBe(true);
    });

    it('should return false when not collected', async () => {
      prisma.collectionPoints.findUnique.mockResolvedValue(testCollectionPoints.pointA1);
      prisma.deviceSession.findUnique.mockResolvedValue(testDeviceSessions.activeSession);
      prisma.collectedPoints.findFirst.mockResolvedValue(null);

      const result = await service.isCollectionAlreadyCollected(
        testCollectionPoints.pointA1.collection_point_id,
        testDeviceSessions.activeSession.session_id,
      );

      expect(result).toBe(false);
    });

    it('should throw NotFoundException when collection point not found', async () => {
      prisma.collectionPoints.findUnique.mockResolvedValue(null);

      await expect(
        service.isCollectionAlreadyCollected('nonexistent', 'session-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when session not found', async () => {
      prisma.collectionPoints.findUnique.mockResolvedValue(testCollectionPoints.pointA1);
      prisma.deviceSession.findUnique.mockResolvedValue(null);

      await expect(
        service.isCollectionAlreadyCollected('cp-id', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
