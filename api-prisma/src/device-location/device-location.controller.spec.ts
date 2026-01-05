import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeviceLocationController } from './device-location.controller';
import { DeviceLocationService } from './device-location.service';
import { testDeviceLocations, createDTOs } from '../test/fixtures';

describe('DeviceLocationController', () => {
  let controller: DeviceLocationController;
  let service: jest.Mocked<DeviceLocationService>;

  const mockDeviceLocationService = {
    create: jest.fn(),
    createBatch: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByDevice: jest.fn(),
    findBySession: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeviceLocationController],
      providers: [
        {
          provide: DeviceLocationService,
          useValue: mockDeviceLocationService,
        },
      ],
    }).compile();

    controller = module.get<DeviceLocationController>(DeviceLocationController);
    service = module.get(DeviceLocationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a device location and return success response', async () => {
      const createDto = createDTOs.createDeviceLocation;
      mockDeviceLocationService.create.mockResolvedValue(testDeviceLocations.location1);

      const result = await controller.create(createDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Device location created successfully');
      expect(result.data).toEqual(testDeviceLocations.location1);
    });
  });

  describe('findAll', () => {
    it('should return all device locations', async () => {
      const locations = [testDeviceLocations.location1, testDeviceLocations.location2];
      mockDeviceLocationService.findAll.mockResolvedValue(locations);

      const result = await controller.findAll();

      expect(result.success).toBe(true);
      expect(result.message).toBe('Device locations retrieved successfully');
      expect(result.total).toBe(2);
    });
  });

  describe('findOne', () => {
    it('should return a device location by ID', async () => {
      mockDeviceLocationService.findOne.mockResolvedValue(testDeviceLocations.location1);

      const result = await controller.findOne(testDeviceLocations.location1.device_location_id);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Device location retrieved successfully');
      expect(result.data).toEqual(testDeviceLocations.location1);
    });

    it('should throw NotFoundException when location not found', async () => {
      mockDeviceLocationService.findOne.mockResolvedValue(null);

      await expect(controller.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByDevice', () => {
    it('should return locations for a specific device', async () => {
      mockDeviceLocationService.findByDevice.mockResolvedValue([testDeviceLocations.location1]);

      const result = await controller.findByDevice('device-id');

      expect(service.findByDevice).toHaveBeenCalledWith('device-id');
      expect(result.success).toBe(true);
      expect(result.total).toBe(1);
    });
  });

  describe('findBySession', () => {
    it('should return locations for a specific session', async () => {
      mockDeviceLocationService.findBySession.mockResolvedValue([testDeviceLocations.location1]);

      const result = await controller.findBySession('session-id');

      expect(service.findBySession).toHaveBeenCalledWith('session-id');
      expect(result.success).toBe(true);
      expect(result.total).toBe(1);
    });
  });

  describe('update', () => {
    it('should update a device location and return success response', async () => {
      const updateDto = { latitude: 35.7 };
      mockDeviceLocationService.update.mockResolvedValue({
        ...testDeviceLocations.location1,
        ...updateDto,
      });

      const result = await controller.update(testDeviceLocations.location1.device_location_id, updateDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Device location updated successfully');
    });
  });

  describe('remove', () => {
    it('should delete a device location and return success response', async () => {
      mockDeviceLocationService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(testDeviceLocations.location1.device_location_id);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Device location deleted successfully');
    });
  });

  describe('createBatch', () => {
    it('should create batch of device locations', async () => {
      const createDtos = [createDTOs.createDeviceLocation];
      mockDeviceLocationService.createBatch.mockResolvedValue([testDeviceLocations.location1]);

      const result = await controller.createBatch(createDtos);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Device locations created successfully');
    });
  });
});
