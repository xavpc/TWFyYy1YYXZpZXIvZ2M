import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RouteCoordinatesController } from './route-coordinates.controller';
import { RouteCoordinatesService } from './route-coordinates.service';
import { testRouteCoordinates, createDTOs } from '../test/fixtures';

describe('RouteCoordinatesController', () => {
  let controller: RouteCoordinatesController;
  let service: jest.Mocked<RouteCoordinatesService>;

  const mockRouteCoordinatesService = {
    create: jest.fn(),
    createBatch: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByRoute: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    removeAllByRouteId: jest.fn(),
    removeUserPointWithGeneratedPoints: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RouteCoordinatesController],
      providers: [
        {
          provide: RouteCoordinatesService,
          useValue: mockRouteCoordinatesService,
        },
      ],
    }).compile();

    controller = module.get<RouteCoordinatesController>(RouteCoordinatesController);
    service = module.get(RouteCoordinatesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create route coordinates and return success response', async () => {
      const createDto = createDTOs.createRouteCoordinate;
      mockRouteCoordinatesService.create.mockResolvedValue(testRouteCoordinates.coordA1);

      const result = await controller.create(createDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Route coordinates created successfully');
    });
  });

  describe('createBatch', () => {
    it('should create batch of route coordinates', async () => {
      const createDtos = [createDTOs.createRouteCoordinate];
      mockRouteCoordinatesService.createBatch.mockResolvedValue([testRouteCoordinates.coordA1]);

      const result = await controller.createBatch(createDtos);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Route coordinates batch created successfully');
      expect(result.total).toBe(1);
    });
  });

  describe('findAll', () => {
    it('should return all route coordinates', async () => {
      const coordinates = [testRouteCoordinates.coordA1, testRouteCoordinates.coordA2];
      mockRouteCoordinatesService.findAll.mockResolvedValue(coordinates);

      const result = await controller.findAll();

      expect(result.success).toBe(true);
      expect(result.message).toBe('Route coordinates retrieved successfully');
      expect(result.total).toBe(2);
    });
  });

  describe('findOne', () => {
    it('should return route coordinates by ID', async () => {
      mockRouteCoordinatesService.findOne.mockResolvedValue(testRouteCoordinates.coordA1);

      const result = await controller.findOne(testRouteCoordinates.coordA1.route_coordinates_id);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Route coordinates retrieved successfully');
    });

    it('should throw NotFoundException when coordinates not found', async () => {
      mockRouteCoordinatesService.findOne.mockResolvedValue(null);

      await expect(controller.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByRoute', () => {
    it('should return coordinates for a specific route', async () => {
      mockRouteCoordinatesService.findByRoute.mockResolvedValue([testRouteCoordinates.coordA1]);

      const result = await controller.findByRoute('route-id');

      expect(service.findByRoute).toHaveBeenCalledWith('route-id');
      expect(result.success).toBe(true);
      expect(result.total).toBe(1);
    });
  });

  describe('update', () => {
    it('should update route coordinates and return success response', async () => {
      const updateDto = { latitude: 35.7 };
      mockRouteCoordinatesService.update.mockResolvedValue({
        ...testRouteCoordinates.coordA1,
        ...updateDto,
      });

      const result = await controller.update(testRouteCoordinates.coordA1.route_coordinates_id, updateDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Route coordinates updated successfully');
    });
  });

  describe('remove', () => {
    it('should delete route coordinates and return success response', async () => {
      mockRouteCoordinatesService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(testRouteCoordinates.coordA1.route_coordinates_id);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Route coordinates deleted successfully');
    });
  });

  describe('removeByRouteId', () => {
    it('should delete all coordinates for a route', async () => {
      mockRouteCoordinatesService.removeAllByRouteId.mockResolvedValue({ affected: 5 });

      const result = await controller.removeByRouteId('route-id');

      expect(result.success).toBe(true);
      expect(result.message).toBe('All route coordinates deleted successfully');
      expect(result.affected).toBe(5);
    });

    it('should return message when route is empty', async () => {
      mockRouteCoordinatesService.removeAllByRouteId.mockResolvedValue({ affected: 0 });

      const result = await controller.removeByRouteId('route-id');

      expect(result.success).toBe(true);
      expect(result.affected).toBe(0);
    });
  });

  describe('removeUserPointWithGeneratedPoints', () => {
    it('should delete user point and associated generated points', async () => {
      const coord = {
        ...testRouteCoordinates.coordA1,
        route: { route_id: 'route-id' },
      };
      mockRouteCoordinatesService.findOne.mockResolvedValue(coord);
      mockRouteCoordinatesService.findByRoute
        .mockResolvedValueOnce([coord, testRouteCoordinates.coordA2])
        .mockResolvedValueOnce([]);
      mockRouteCoordinatesService.removeUserPointWithGeneratedPoints.mockResolvedValue(undefined);

      const result = await controller.removeUserPointWithGeneratedPoints(coord.route_coordinates_id);

      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(2);
    });
  });
});
