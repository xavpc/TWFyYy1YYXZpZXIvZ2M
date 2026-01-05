import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CollectedPointsController } from './collected-points.controller';
import { CollectedPointsService } from './collected-points.service';
import { testCollectedPoints, createDTOs } from '../test/fixtures';

describe('CollectedPointsController', () => {
  let controller: CollectedPointsController;
  let service: jest.Mocked<CollectedPointsService>;

  const mockCollectedPointsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByDevice: jest.fn(),
    findBySession: jest.fn(),
    isCollectionAlreadyCollected: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectedPointsController],
      providers: [
        {
          provide: CollectedPointsService,
          useValue: mockCollectedPointsService,
        },
      ],
    }).compile();

    controller = module.get<CollectedPointsController>(CollectedPointsController);
    service = module.get(CollectedPointsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a collected point and return success response', async () => {
      const createDto = createDTOs.createCollectedPoint;
      mockCollectedPointsService.create.mockResolvedValue(testCollectedPoints.collected1);

      const result = await controller.create(createDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Collected points created successfully');
      expect(result.data).toEqual(testCollectedPoints.collected1);
    });
  });

  describe('findAll', () => {
    it('should return all collected points', async () => {
      const points = [testCollectedPoints.collected1, testCollectedPoints.collected2];
      mockCollectedPointsService.findAll.mockResolvedValue(points);

      const result = await controller.findAll();

      expect(result.success).toBe(true);
      expect(result.message).toBe('Collected points retrieved successfully');
      expect(result.total).toBe(2);
    });
  });

  describe('findOne', () => {
    it('should return a collected point by ID', async () => {
      mockCollectedPointsService.findOne.mockResolvedValue(testCollectedPoints.collected1);

      const result = await controller.findOne(testCollectedPoints.collected1.collected_point_id);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Collected points retrieved successfully');
      expect(result.data).toEqual(testCollectedPoints.collected1);
    });

    it('should throw NotFoundException when collected point not found', async () => {
      mockCollectedPointsService.findOne.mockResolvedValue(null);

      await expect(controller.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByDevice', () => {
    it('should return collected points for a specific device', async () => {
      mockCollectedPointsService.findByDevice.mockResolvedValue([testCollectedPoints.collected1]);

      const result = await controller.findByDevice('device-id');

      expect(service.findByDevice).toHaveBeenCalledWith('device-id');
      expect(result.success).toBe(true);
      expect(result.total).toBe(1);
    });
  });

  describe('findBySession', () => {
    it('should return collected points for a specific session', async () => {
      mockCollectedPointsService.findBySession.mockResolvedValue([testCollectedPoints.collected1]);

      const result = await controller.findBySession('session-id');

      expect(service.findBySession).toHaveBeenCalledWith('session-id');
      expect(result.success).toBe(true);
      expect(result.total).toBe(1);
    });
  });

  describe('checkCollectionStatus', () => {
    it('should return true when collection point has been collected', async () => {
      mockCollectedPointsService.isCollectionAlreadyCollected.mockResolvedValue(true);

      const result = await controller.checkCollectionStatus('collection-point-id', 'session-id');

      expect(service.isCollectionAlreadyCollected).toHaveBeenCalledWith('collection-point-id', 'session-id');
      expect(result.success).toBe(true);
      expect(result.isCollected).toBe(true);
      expect(result.message).toBe('Collection point has been collected.');
    });

    it('should return false when collection point has not been collected', async () => {
      mockCollectedPointsService.isCollectionAlreadyCollected.mockResolvedValue(false);

      const result = await controller.checkCollectionStatus('collection-point-id', 'session-id');

      expect(result.success).toBe(true);
      expect(result.isCollected).toBe(false);
      expect(result.message).toBe('Collection point has not been collected.');
    });
  });

  describe('update', () => {
    it('should update a collected point and return success response', async () => {
      const updateDto = { collection_point_id: 'updated-collection-point-id' };
      mockCollectedPointsService.update.mockResolvedValue({
        ...testCollectedPoints.collected1,
        ...updateDto,
      });

      const result = await controller.update(testCollectedPoints.collected1.collected_point_id, updateDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Collected points updated successfully');
    });
  });

  describe('remove', () => {
    it('should delete a collected point and return success response', async () => {
      mockCollectedPointsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(testCollectedPoints.collected1.collected_point_id);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Collected points deleted successfully');
    });
  });
});
