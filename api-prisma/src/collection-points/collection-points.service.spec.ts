import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CollectionPointsService } from './collection-points.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrismaService, resetPrismaMocks } from '../test/mocks/prisma.mock';
import { testCollectionPoints, testRoutes, createDTOs } from '../test/fixtures';

describe('CollectionPointsService', () => {
  let service: CollectionPointsService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    resetPrismaMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectionPointsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CollectionPointsService>(CollectionPointsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create collection point', async () => {
      const createDto = createDTOs.createCollectionPoint;
      prisma.route.findUnique.mockResolvedValue(testRoutes.routeA);
      prisma.collectionPoints.create.mockResolvedValue({
        ...testCollectionPoints.pointA1,
        ...createDto,
      });

      const result = await service.create(createDto);

      expect(prisma.collectionPoints.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when route not found', async () => {
      prisma.route.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          ...createDTOs.createCollectionPoint,
          route_id: 'nonexistent',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createBatch', () => {
    it('should create multiple collection points', async () => {
      prisma.route.findUnique.mockResolvedValue(testRoutes.routeA);
      prisma.collectionPoints.findMany.mockResolvedValue([]);
      prisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          collectionPoints: {
            create: jest.fn().mockResolvedValue(testCollectionPoints.pointA1),
          },
        });
      });

      const batch = [
        { ...createDTOs.createCollectionPoint, sequence: 1 },
        { ...createDTOs.createCollectionPoint, sequence: 2, collection_point_name: 'Point 2' },
      ];

      const result = await service.createBatch(batch);

      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should throw ConflictException for duplicate sequences in batch', async () => {
      const batch = [
        { ...createDTOs.createCollectionPoint, sequence: 1 },
        { ...createDTOs.createCollectionPoint, sequence: 1 },
      ];

      await expect(service.createBatch(batch)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when sequences conflict with existing', async () => {
      prisma.route.findUnique.mockResolvedValue(testRoutes.routeA);
      prisma.collectionPoints.findMany.mockResolvedValue([testCollectionPoints.pointA1]);

      const batch = [
        { ...createDTOs.createCollectionPoint, sequence: 1 },
      ];

      await expect(service.createBatch(batch)).rejects.toThrow(ConflictException);
    });

    it('should return empty array for empty input', async () => {
      const result = await service.createBatch([]);

      expect(result).toEqual([]);
    });
  });

  describe('findAll', () => {
    it('should return all collection points', async () => {
      const points = [testCollectionPoints.pointA1, testCollectionPoints.pointA2];
      prisma.collectionPoints.findMany.mockResolvedValue(points);

      const result = await service.findAll();

      expect(result).toEqual(points);
    });
  });

  describe('findOne', () => {
    it('should return collection point by ID', async () => {
      prisma.collectionPoints.findUnique.mockResolvedValue(testCollectionPoints.pointA1);

      const result = await service.findOne(testCollectionPoints.pointA1.collection_point_id);

      expect(result).toEqual(testCollectionPoints.pointA1);
    });

    it('should throw NotFoundException for invalid ID', async () => {
      prisma.collectionPoints.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update collection point', async () => {
      prisma.collectionPoints.findUnique.mockResolvedValue(testCollectionPoints.pointA1);
      prisma.collectionPoints.update.mockResolvedValue({
        ...testCollectionPoints.pointA1,
        collection_point_name: 'Updated Name',
      });

      const result = await service.update(
        testCollectionPoints.pointA1.collection_point_id,
        { collection_point_name: 'Updated Name' },
      );

      expect(result.collection_point_name).toBe('Updated Name');
    });

    it('should throw NotFoundException when route not found on update', async () => {
      prisma.collectionPoints.findUnique.mockResolvedValue(testCollectionPoints.pointA1);
      prisma.route.findUnique.mockResolvedValue(null);

      await expect(
        service.update(testCollectionPoints.pointA1.collection_point_id, {
          route_id: 'nonexistent',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete collection point and update sequences', async () => {
      prisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          collectionPoints: {
            findUnique: jest.fn().mockResolvedValue(testCollectionPoints.pointA1),
            delete: jest.fn().mockResolvedValue(testCollectionPoints.pointA1),
            updateMany: jest.fn().mockResolvedValue({ count: 2 }),
          },
        });
      });

      await service.remove(testCollectionPoints.pointA1.collection_point_id);

      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('removeBySequence', () => {
    it('should delete by route and sequence', async () => {
      prisma.collectionPoints.findFirst.mockResolvedValue(testCollectionPoints.pointA1);
      prisma.collectionPoints.delete.mockResolvedValue(testCollectionPoints.pointA1);

      await service.removeBySequence(testRoutes.routeA.route_id, 1);

      expect(prisma.collectionPoints.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.collectionPoints.findFirst.mockResolvedValue(null);

      await expect(
        service.removeBySequence(testRoutes.routeA.route_id, 999),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByRoute', () => {
    it('should return collection points for route', async () => {
      const points = [testCollectionPoints.pointA1, testCollectionPoints.pointA2];
      prisma.collectionPoints.findMany.mockResolvedValue(points);

      const result = await service.findByRoute(testRoutes.routeA.route_id);

      expect(result).toHaveLength(2);
      expect(prisma.collectionPoints.findMany).toHaveBeenCalledWith({
        where: { route_id: testRoutes.routeA.route_id },
        include: { route: true },
      });
    });
  });

  describe('findByName', () => {
    it('should return collection point by name', async () => {
      prisma.collectionPoints.findFirst.mockResolvedValue(testCollectionPoints.pointA1);

      const result = await service.findByName('Point A-1 Station');

      expect(result).toEqual(testCollectionPoints.pointA1);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.collectionPoints.findFirst.mockResolvedValue(null);

      await expect(service.findByName('Nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeAllByRouteId', () => {
    it('should delete all points for route', async () => {
      prisma.route.findUnique.mockResolvedValue(testRoutes.routeA);
      prisma.collectionPoints.deleteMany.mockResolvedValue({ count: 3 });

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
});
