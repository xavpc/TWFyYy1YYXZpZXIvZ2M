import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { RouteService } from './route.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrismaService, resetPrismaMocks } from '../test/mocks/prisma.mock';
import { testRoutes, createDTOs } from '../test/fixtures';

describe('RouteService', () => {
  let service: RouteService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    resetPrismaMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RouteService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RouteService>(RouteService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create route with unique name', async () => {
      const createDto = createDTOs.createRoute;
      prisma.route.findUnique.mockResolvedValue(null);
      prisma.route.create.mockResolvedValue({
        ...testRoutes.routeA,
        route_name: createDto.route_name,
      });

      const result = await service.create(createDto);

      expect(prisma.route.create).toHaveBeenCalledWith({
        data: createDto,
      });
      expect(result.route_name).toBe(createDto.route_name);
    });

    it('should reject duplicate route name', async () => {
      prisma.route.findUnique.mockResolvedValue(testRoutes.routeA);

      await expect(
        service.create({ route_name: testRoutes.routeA.route_name }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all routes without filter', async () => {
      const routes = [testRoutes.routeA, testRoutes.routeB];
      prisma.route.findMany.mockResolvedValue(routes);
      prisma.collectionPoints.count.mockResolvedValue(3);
      prisma.deviceRoute.count.mockResolvedValue(2);
      prisma.routeCoordinates.count.mockResolvedValue(5);

      const result = await service.findAll();

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toHaveProperty('collection_points_count');
      expect(result.data[0]).toHaveProperty('devices_count');
    });

    it('should apply pagination', async () => {
      prisma.route.findMany.mockResolvedValue([testRoutes.routeA]);
      prisma.route.count.mockResolvedValue(10);
      prisma.collectionPoints.count.mockResolvedValue(3);
      prisma.deviceRoute.count.mockResolvedValue(2);
      prisma.routeCoordinates.count.mockResolvedValue(5);

      await service.findAll({ page: 2, limit: 5 });

      expect(prisma.route.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        }),
      );
    });

    it('should apply global search', async () => {
      prisma.route.findMany.mockResolvedValue([]);
      prisma.route.count.mockResolvedValue(0);

      await service.findAll({ search: 'Downtown' });

      expect(prisma.route.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { route_name: { contains: 'Downtown' } },
            ]),
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return route with relations', async () => {
      prisma.route.findUnique.mockResolvedValue(testRoutes.routeA);
      prisma.collectionPoints.count.mockResolvedValue(3);

      const result = await service.findOne(testRoutes.routeA.route_id);

      expect(result).toHaveProperty('collection_points_count');
      expect(prisma.route.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { route_id: testRoutes.routeA.route_id },
          include: expect.objectContaining({
            images: true,
            device_routes: expect.any(Object),
          }),
        }),
      );
    });

    it('should throw NotFoundException for invalid ID', async () => {
      prisma.route.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByName', () => {
    it('should find route by name', async () => {
      prisma.route.findUnique.mockResolvedValue(testRoutes.routeA);
      prisma.collectionPoints.count.mockResolvedValue(3);

      const result = await service.findByName(testRoutes.routeA.route_name);

      expect(result.route_name).toBe(testRoutes.routeA.route_name);
    });

    it('should throw NotFoundException for nonexistent name', async () => {
      prisma.route.findUnique.mockResolvedValue(null);

      await expect(service.findByName('Nonexistent Route')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update route name', async () => {
      const updateDto = { route_name: 'Updated Route' };
      prisma.route.findUnique
        .mockResolvedValueOnce(testRoutes.routeA)
        .mockResolvedValueOnce(null);
      prisma.collectionPoints.count.mockResolvedValue(0);
      prisma.route.update.mockResolvedValue({
        ...testRoutes.routeA,
        ...updateDto,
      });

      const result = await service.update(testRoutes.routeA.route_id, updateDto);

      expect(result.route_name).toBe('Updated Route');
    });

    it('should reject duplicate name on update', async () => {
      prisma.route.findUnique
        .mockResolvedValueOnce(testRoutes.routeA)
        .mockResolvedValueOnce(testRoutes.routeB);
      prisma.collectionPoints.count.mockResolvedValue(0);

      await expect(
        service.update(testRoutes.routeA.route_id, {
          route_name: testRoutes.routeB.route_name,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should delete route', async () => {
      prisma.route.findUnique.mockResolvedValue(testRoutes.routeA);
      prisma.collectionPoints.count.mockResolvedValue(0);
      prisma.route.delete.mockResolvedValue(testRoutes.routeA);

      await service.remove(testRoutes.routeA.route_id);

      expect(prisma.route.delete).toHaveBeenCalledWith({
        where: { route_id: testRoutes.routeA.route_id },
      });
    });

    it('should throw NotFoundException for invalid ID', async () => {
      prisma.route.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('globalSearch', () => {
    it('should search by name', async () => {
      prisma.route.findMany.mockResolvedValue([testRoutes.routeA]);
      prisma.collectionPoints.count.mockResolvedValue(3);

      const result = await service.globalSearch('Downtown');

      expect(result).toHaveLength(1);
    });

    it('should throw NotFoundException when no results', async () => {
      prisma.route.findMany.mockResolvedValue([]);

      await expect(service.globalSearch('NonExistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('searchByField', () => {
    it('should search by route_name', async () => {
      prisma.route.findMany.mockResolvedValue([testRoutes.routeA]);
      prisma.collectionPoints.count.mockResolvedValue(3);

      const result = await service.searchByField('route_name', 'Downtown');

      expect(result).toHaveLength(1);
    });

    it('should throw NotFoundException for invalid field', async () => {
      await expect(
        service.searchByField('invalid' as any, 'value'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when no results', async () => {
      prisma.route.findMany.mockResolvedValue([]);

      await expect(
        service.searchByField('route_name', 'NonExistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCoordinateRange', () => {
    it('should find routes in range', async () => {
      prisma.route.findMany.mockResolvedValue([testRoutes.routeA]);
      prisma.collectionPoints.count.mockResolvedValue(3);

      const result = await service.findByCoordinateRange(35.0, 36.0, 139.0, 140.0);

      expect(result).toHaveLength(1);
      expect(prisma.route.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            center_latitude: { gte: 35.0, lte: 36.0 },
            center_longitude: { gte: 139.0, lte: 140.0 },
          },
        }),
      );
    });

    it('should throw NotFoundException when no routes in range', async () => {
      prisma.route.findMany.mockResolvedValue([]);

      await expect(
        service.findByCoordinateRange(0, 1, 0, 1),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByAssignedDevice', () => {
    it('should find routes for device', async () => {
      prisma.route.findMany.mockResolvedValue([testRoutes.routeA]);
      prisma.collectionPoints.count.mockResolvedValue(3);

      const result = await service.findByAssignedDevice('device-id');

      expect(result).toHaveLength(1);
    });

    it('should throw NotFoundException when no routes for device', async () => {
      prisma.route.findMany.mockResolvedValue([]);

      await expect(
        service.findByAssignedDevice('nonexistent-device'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByDay', () => {
    it('should find routes for day of week', async () => {
      prisma.route.findMany.mockResolvedValue([testRoutes.routeA]);
      prisma.collectionPoints.count.mockResolvedValue(3);

      const result = await service.findByDay('monday');

      expect(result).toHaveLength(1);
    });

    it('should throw NotFoundException when no routes for day', async () => {
      prisma.route.findMany.mockResolvedValue([]);

      await expect(service.findByDay('sunday')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getRoutesWithImageCount', () => {
    it('should include image count', async () => {
      const routeWithCount = {
        ...testRoutes.routeA,
        images: [],
        device_routes: [],
        _count: { images: 5, collection_points: 10 },
      };
      prisma.route.findMany.mockResolvedValue([routeWithCount]);

      const result = await service.getRoutesWithImageCount();

      expect(result[0]).toHaveProperty('image_count', 5);
      expect(result[0]).toHaveProperty('collection_points_count', 10);
    });
  });

  describe('getRouteStatistics', () => {
    it('should return statistics', async () => {
      prisma.route.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(8)
        .mockResolvedValueOnce(6)
        .mockResolvedValueOnce(9);

      const result = await service.getRouteStatistics();

      expect(result).toEqual({
        total_routes: 10,
        routes_with_assigned_devices: 8,
        routes_with_images: 6,
        routes_with_collection_points: 9,
        routes_without_devices: 2,
      });
    });
  });
});
