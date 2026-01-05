import { Test, TestingModule } from '@nestjs/testing';
import { RouteController } from './route.controller';
import { RouteService } from './route.service';
import { testRoutes, createDTOs } from '../test/fixtures';

describe('RouteController', () => {
  let controller: RouteController;
  let routeService: jest.Mocked<RouteService>;

  const mockRouteService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByName: jest.fn(),
    findByAssignedDevice: jest.fn(),
    findByDay: jest.fn(),
    findByCoordinateRange: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    globalSearch: jest.fn(),
    searchByField: jest.fn(),
    getRoutesWithImageCount: jest.fn(),
    getRouteStatistics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RouteController],
      providers: [
        {
          provide: RouteService,
          useValue: mockRouteService,
        },
      ],
    }).compile();

    controller = module.get<RouteController>(RouteController);
    routeService = module.get(RouteService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a route and return success response', async () => {
      const createDto = createDTOs.createRoute;
      mockRouteService.create.mockResolvedValue(testRoutes.routeA);

      const result = await controller.create(createDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Route created successfully');
      expect(result.data).toEqual(testRoutes.routeA);
    });
  });

  describe('findAll', () => {
    it('should return all routes with pagination', async () => {
      const routes = [testRoutes.routeA, testRoutes.routeB];
      mockRouteService.findAll.mockResolvedValue({
        data: routes,
        total: 2,
      });

      const result = await controller.findAll({});

      expect(result.success).toBe(true);
      expect(result.message).toBe('Routes retrieved successfully');
      expect(result.data).toEqual(routes);
      expect(result.total).toBe(2);
    });

    it('should include pagination info when filters provided', async () => {
      mockRouteService.findAll.mockResolvedValue({
        data: [testRoutes.routeA],
        total: 10,
      });

      const result = await controller.findAll({ page: 1, limit: 5 });

      expect(result.pagination).toBeDefined();
      expect(result.pagination?.page).toBe(1);
      expect(result.pagination?.limit).toBe(5);
    });
  });

  describe('globalSearch', () => {
    it('should perform global search and return results', async () => {
      mockRouteService.globalSearch.mockResolvedValue([testRoutes.routeA]);

      const result = await controller.globalSearch('Downtown');

      expect(routeService.globalSearch).toHaveBeenCalledWith('Downtown');
      expect(result.success).toBe(true);
      expect(result.data).toEqual([testRoutes.routeA]);
    });
  });

  describe('searchByField', () => {
    it('should search routes by field', async () => {
      mockRouteService.searchByField.mockResolvedValue([testRoutes.routeA]);

      const result = await controller.searchByField('route_name', 'Main');

      expect(routeService.searchByField).toHaveBeenCalledWith('route_name', 'Main');
      expect(result.success).toBe(true);
      expect(result.data).toEqual([testRoutes.routeA]);
    });
  });

  describe('findByCoordinateRange', () => {
    it('should find routes within coordinate range', async () => {
      mockRouteService.findByCoordinateRange.mockResolvedValue([testRoutes.routeA]);

      const result = await controller.findByCoordinateRange('35.6', '35.7', '139.6', '139.7');

      expect(routeService.findByCoordinateRange).toHaveBeenCalledWith(35.6, 35.7, 139.6, 139.7);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([testRoutes.routeA]);
    });
  });

  describe('findByAssignedDevice', () => {
    it('should find routes assigned to a device', async () => {
      mockRouteService.findByAssignedDevice.mockResolvedValue([testRoutes.routeA]);

      const result = await controller.findByAssignedDevice('device-id');

      expect(routeService.findByAssignedDevice).toHaveBeenCalledWith('device-id');
      expect(result.success).toBe(true);
      expect(result.data).toEqual([testRoutes.routeA]);
    });
  });

  describe('findByDay', () => {
    it('should find routes assigned for a specific day', async () => {
      mockRouteService.findByDay.mockResolvedValue([testRoutes.routeA]);

      const result = await controller.findByDay('MONDAY');

      expect(routeService.findByDay).toHaveBeenCalledWith('MONDAY');
      expect(result.success).toBe(true);
      expect(result.data).toEqual([testRoutes.routeA]);
    });
  });

  describe('getRoutesWithImageCount', () => {
    it('should return routes with image count', async () => {
      const routesWithCount = [{ ...testRoutes.routeA, image_count: 5 }];
      mockRouteService.getRoutesWithImageCount.mockResolvedValue(routesWithCount);

      const result = await controller.getRoutesWithImageCount();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(routesWithCount);
    });
  });

  describe('getRouteStatistics', () => {
    it('should return route statistics', async () => {
      const stats = {
        total_routes: 10,
        routes_with_assigned_devices: 8,
        routes_with_images: 6,
        routes_without_devices: 2,
      };
      mockRouteService.getRouteStatistics.mockResolvedValue(stats);

      const result = await controller.getRouteStatistics();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(stats);
    });
  });

  describe('findByName', () => {
    it('should find a route by name', async () => {
      mockRouteService.findByName.mockResolvedValue(testRoutes.routeA);

      const result = await controller.findByName('Main Street');

      expect(routeService.findByName).toHaveBeenCalledWith('Main Street');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(testRoutes.routeA);
    });
  });

  describe('findOne', () => {
    it('should return a route by ID', async () => {
      mockRouteService.findOne.mockResolvedValue(testRoutes.routeA);

      const result = await controller.findOne(testRoutes.routeA.route_id);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Route retrieved successfully');
      expect(result.data).toEqual(testRoutes.routeA);
    });
  });

  describe('update', () => {
    it('should update a route and return success response', async () => {
      const updateDto = { route_name: 'Updated Route' };
      mockRouteService.update.mockResolvedValue({
        ...testRoutes.routeA,
        ...updateDto,
      });

      const result = await controller.update(testRoutes.routeA.route_id, updateDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Route updated successfully');
    });
  });

  describe('remove', () => {
    it('should delete a route and return success response', async () => {
      mockRouteService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(testRoutes.routeA.route_id);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Route deleted successfully');
    });
  });
});
