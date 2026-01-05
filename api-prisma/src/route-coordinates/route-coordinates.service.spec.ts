import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RouteCoordinatesService } from './route-coordinates.service';
import { PrismaService } from '../prisma/prisma.service';
import { GmapsRoutingService } from '../third-party/routing-engine/google-maps/gmaps.service';
import { mockPrismaService, resetPrismaMocks } from '../test/mocks/prisma.mock';
import { testRouteCoordinates, testRoutes, createDTOs } from '../test/fixtures';

describe('RouteCoordinatesService', () => {
  let service: RouteCoordinatesService;
  let prisma: typeof mockPrismaService;

  const mockGmapsService = {
    getRoute: jest.fn().mockResolvedValue({
      coordinates: [
        { lat: 35.6762, lng: 139.6503 },
        { lat: 35.6765, lng: 139.6505 },
        { lat: 35.6770, lng: 139.6510 },
      ],
    }),
  };

  beforeEach(async () => {
    resetPrismaMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RouteCoordinatesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: GmapsRoutingService,
          useValue: mockGmapsService,
        },
      ],
    }).compile();

    service = module.get<RouteCoordinatesService>(RouteCoordinatesService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create coordinate', async () => {
      prisma.route.findUnique.mockResolvedValue(testRoutes.routeA);
      prisma.routeCoordinates.count.mockResolvedValue(0);
      prisma.routeCoordinates.create.mockResolvedValue(testRouteCoordinates.coordA1);
      prisma.routeCoordinates.findMany.mockResolvedValue([testRouteCoordinates.coordA1]);
      prisma.route.update.mockResolvedValue(testRoutes.routeA);

      const result = await service.create(createDTOs.createRouteCoordinate);

      expect(prisma.routeCoordinates.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when route not found', async () => {
      prisma.route.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          ...createDTOs.createRouteCoordinate,
          route_id: 'nonexistent',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should validate latitude range (-90 to 90)', async () => {
      prisma.route.findUnique.mockResolvedValue(testRoutes.routeA);
      prisma.routeCoordinates.count.mockResolvedValue(0);
      prisma.routeCoordinates.create.mockResolvedValue(testRouteCoordinates.coordA1);
      prisma.routeCoordinates.findMany.mockResolvedValue([testRouteCoordinates.coordA1]);

      // Valid latitude
      await service.create({
        ...createDTOs.createRouteCoordinate,
        latitude: 45.0,
      });

      expect(prisma.routeCoordinates.create).toHaveBeenCalled();
    });
  });

  describe('createBatch', () => {
    it('should create multiple coordinates', async () => {
      prisma.route.findUnique.mockResolvedValue(testRoutes.routeA);
      prisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          routeCoordinates: {
            create: jest.fn().mockResolvedValue(testRouteCoordinates.coordA1),
            findMany: jest.fn().mockResolvedValue([testRouteCoordinates.coordA1]),
          },
          route: {
            update: jest.fn().mockResolvedValue(testRoutes.routeA),
          },
        });
      });

      const batch = [
        { ...createDTOs.createRouteCoordinate, sequence: 1 },
        { ...createDTOs.createRouteCoordinate, sequence: 2 },
      ];

      const result = await service.createBatch(batch);

      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should return empty array for empty input', async () => {
      const result = await service.createBatch([]);

      expect(result).toEqual([]);
    });

    it('should throw error when coordinates belong to different routes', async () => {
      const batch = [
        { ...createDTOs.createRouteCoordinate, route_id: 'route-1' },
        { ...createDTOs.createRouteCoordinate, route_id: 'route-2' },
      ];

      await expect(service.createBatch(batch)).rejects.toThrow(
        'All coordinates in batch must belong to the same route',
      );
    });

    it('should throw NotFoundException when route not found', async () => {
      prisma.route.findUnique.mockResolvedValue(null);

      await expect(
        service.createBatch([createDTOs.createRouteCoordinate]),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all coordinates', async () => {
      const coordinates = [testRouteCoordinates.coordA1, testRouteCoordinates.coordA2];
      prisma.routeCoordinates.findMany.mockResolvedValue(coordinates);

      const result = await service.findAll();

      expect(result).toEqual(coordinates);
    });
  });

  describe('findOne', () => {
    it('should return coordinate by ID', async () => {
      prisma.routeCoordinates.findUnique.mockResolvedValue(testRouteCoordinates.coordA1);

      const result = await service.findOne(testRouteCoordinates.coordA1.route_coordinates_id);

      expect(result).toEqual(testRouteCoordinates.coordA1);
    });

    it('should throw NotFoundException for invalid ID', async () => {
      prisma.routeCoordinates.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update coordinate', async () => {
      const coordWithRoute = {
        ...testRouteCoordinates.coordA1,
        route: testRoutes.routeA,
      };
      prisma.routeCoordinates.findUnique.mockResolvedValue(coordWithRoute);
      prisma.routeCoordinates.update.mockResolvedValue({
        ...coordWithRoute,
        latitude: 35.7000,
      });
      prisma.routeCoordinates.findMany.mockResolvedValue([coordWithRoute]);
      prisma.route.update.mockResolvedValue(testRoutes.routeA);

      const result = await service.update(
        testRouteCoordinates.coordA1.route_coordinates_id,
        { latitude: 35.7000 },
      );

      expect(result.latitude).toBe(35.7000);
    });
  });

  describe('remove', () => {
    it('should delete coordinate and resequence', async () => {
      const coordWithRoute = {
        ...testRouteCoordinates.coordA1,
        route: testRoutes.routeA,
      };
      prisma.routeCoordinates.findUnique.mockResolvedValue(coordWithRoute);
      prisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          routeCoordinates: {
            delete: jest.fn(),
            updateMany: jest.fn().mockResolvedValue({ count: 2 }),
            findMany: jest.fn().mockResolvedValue([]),
          },
          route: {
            update: jest.fn(),
          },
        });
      });

      await service.remove(testRouteCoordinates.coordA1.route_coordinates_id);

      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('findByRoute', () => {
    it('should return coordinates for route', async () => {
      const coordinates = [testRouteCoordinates.coordA1, testRouteCoordinates.coordA2];
      prisma.routeCoordinates.findMany.mockResolvedValue(coordinates);

      const result = await service.findByRoute(testRoutes.routeA.route_id);

      expect(result).toHaveLength(2);
    });
  });

  describe('removeAllByRouteId', () => {
    it('should delete all coordinates for route', async () => {
      prisma.route.findUnique.mockResolvedValue(testRoutes.routeA);
      prisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          routeCoordinates: {
            deleteMany: jest.fn().mockResolvedValue({ count: 3 }),
          },
          route: {
            update: jest.fn(),
          },
        });
      });

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
