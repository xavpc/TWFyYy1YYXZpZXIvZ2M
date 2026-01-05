import { Test, TestingModule } from '@nestjs/testing';
import { CollectionPointsController } from './collection-points.controller';
import { CollectionPointsService } from './collection-points.service';
import { testCollectionPoints, createDTOs } from '../test/fixtures';

describe('CollectionPointsController', () => {
  let controller: CollectionPointsController;
  let service: jest.Mocked<CollectionPointsService>;

  const mockCollectionPointsService = {
    create: jest.fn(),
    createBatch: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByRoute: jest.fn(),
    findByName: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    removeBySequence: jest.fn(),
    removeAllByRouteId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectionPointsController],
      providers: [
        {
          provide: CollectionPointsService,
          useValue: mockCollectionPointsService,
        },
      ],
    }).compile();

    controller = module.get<CollectionPointsController>(CollectionPointsController);
    service = module.get(CollectionPointsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a collection point and return success response', async () => {
      const createDto = createDTOs.createCollectionPoint;
      mockCollectionPointsService.create.mockResolvedValue(testCollectionPoints.pointA1);

      const result = await controller.create(createDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Collection point created successfully');
      expect(result.data).toEqual(testCollectionPoints.pointA1);
    });
  });

  describe('createBatch', () => {
    it('should create batch of collection points', async () => {
      const createDtos = [createDTOs.createCollectionPoint];
      mockCollectionPointsService.createBatch.mockResolvedValue([testCollectionPoints.pointA1]);

      const result = await controller.createBatch(createDtos);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Collection points batch created successfully');
      expect(result.total).toBe(1);
    });
  });

  describe('findAll', () => {
    it('should return all collection points', async () => {
      const points = [testCollectionPoints.pointA1, testCollectionPoints.pointA2];
      mockCollectionPointsService.findAll.mockResolvedValue(points);

      const result = await controller.findAll();

      expect(result.success).toBe(true);
      expect(result.message).toBe('Collection points retrieved successfully');
      expect(result.total).toBe(2);
    });
  });

  describe('findOne', () => {
    it('should return a collection point by ID', async () => {
      mockCollectionPointsService.findOne.mockResolvedValue(testCollectionPoints.pointA1);

      const result = await controller.findOne(testCollectionPoints.pointA1.collection_point_id);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Collection point retrieved successfully');
      expect(result.data).toEqual(testCollectionPoints.pointA1);
    });
  });

  describe('findByRoute', () => {
    it('should return collection points for a specific route', async () => {
      mockCollectionPointsService.findByRoute.mockResolvedValue([testCollectionPoints.pointA1]);

      const result = await controller.findByRoute('route-id');

      expect(service.findByRoute).toHaveBeenCalledWith('route-id');
      expect(result.success).toBe(true);
      expect(result.total).toBe(1);
    });
  });

  describe('findByName', () => {
    it('should return a collection point by name', async () => {
      mockCollectionPointsService.findByName.mockResolvedValue(testCollectionPoints.pointA1);

      const result = await controller.findByName('Downtown Collection');

      expect(service.findByName).toHaveBeenCalledWith('Downtown Collection');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(testCollectionPoints.pointA1);
    });
  });

  describe('update', () => {
    it('should update a collection point and return success response', async () => {
      const updateDto = { collection_point_name: 'Updated Point' };
      mockCollectionPointsService.update.mockResolvedValue({
        ...testCollectionPoints.pointA1,
        ...updateDto,
      });

      const result = await controller.update(testCollectionPoints.pointA1.collection_point_id, updateDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Collection point updated successfully');
    });
  });

  describe('removeBySequence', () => {
    it('should delete a collection point by sequence', async () => {
      mockCollectionPointsService.removeBySequence.mockResolvedValue(undefined);

      const result = await controller.removeBySequence('route-id', '1');

      expect(service.removeBySequence).toHaveBeenCalledWith('route-id', 1);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Collection point deleted successfully');
    });
  });

  describe('remove', () => {
    it('should delete a collection point and return success response', async () => {
      mockCollectionPointsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(testCollectionPoints.pointA1.collection_point_id);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Collection point deleted successfully');
    });
  });

  describe('removeByRouteId', () => {
    it('should delete all collection points for a route', async () => {
      mockCollectionPointsService.removeAllByRouteId.mockResolvedValue({ affected: 3 });

      const result = await controller.removeByRouteId('route-id');

      expect(result.success).toBe(true);
      expect(result.message).toBe('All collection points deleted successfully');
      expect(result.affected).toBe(3);
    });

    it('should return message when route has no collection points', async () => {
      mockCollectionPointsService.removeAllByRouteId.mockResolvedValue({ affected: 0 });

      const result = await controller.removeByRouteId('route-id');

      expect(result.success).toBe(true);
      expect(result.affected).toBe(0);
    });
  });
});
