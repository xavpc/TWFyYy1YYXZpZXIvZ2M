import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeviceRouteController } from './device-route.controller';
import { DeviceRouteService } from './device-route.service';
import { testDeviceRoutes, createDTOs } from '../test/fixtures';

describe('DeviceRouteController', () => {
  let controller: DeviceRouteController;
  let service: jest.Mocked<DeviceRouteService>;

  const mockDeviceRouteService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByDevice: jest.fn(),
    findByRoute: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    removeAllByRouteId: jest.fn(),
    removeAllByDeviceId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeviceRouteController],
      providers: [
        {
          provide: DeviceRouteService,
          useValue: mockDeviceRouteService,
        },
      ],
    }).compile();

    controller = module.get<DeviceRouteController>(DeviceRouteController);
    service = module.get(DeviceRouteService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a device route and return success response', async () => {
      const createDto = createDTOs.createDeviceRoute;
      mockDeviceRouteService.create.mockResolvedValue(testDeviceRoutes.deviceRoute1);

      const result = await controller.create(createDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Device route created successfully');
      expect(result.data).toEqual(testDeviceRoutes.deviceRoute1);
    });
  });

  describe('findAll', () => {
    it('should return all device routes', async () => {
      const deviceRoutes = [testDeviceRoutes.deviceRoute1, testDeviceRoutes.deviceRoute2];
      mockDeviceRouteService.findAll.mockResolvedValue(deviceRoutes);

      const result = await controller.findAll();

      expect(result.success).toBe(true);
      expect(result.message).toBe('Device routes retrieved successfully');
      expect(result.total).toBe(2);
    });
  });

  describe('findOne', () => {
    it('should return a device route by ID', async () => {
      mockDeviceRouteService.findOne.mockResolvedValue(testDeviceRoutes.deviceRoute1);

      const result = await controller.findOne(testDeviceRoutes.deviceRoute1.device_route_id);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Device route retrieved successfully');
      expect(result.data).toEqual(testDeviceRoutes.deviceRoute1);
    });

    it('should throw NotFoundException when device route not found', async () => {
      mockDeviceRouteService.findOne.mockResolvedValue(null);

      await expect(controller.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByDevice', () => {
    it('should return device routes for a specific device', async () => {
      mockDeviceRouteService.findByDevice.mockResolvedValue([testDeviceRoutes.deviceRoute1]);

      const result = await controller.findByDevice('device-id');

      expect(service.findByDevice).toHaveBeenCalledWith('device-id');
      expect(result.success).toBe(true);
      expect(result.total).toBe(1);
    });
  });

  describe('findByRoute', () => {
    it('should return device routes for a specific route', async () => {
      mockDeviceRouteService.findByRoute.mockResolvedValue([testDeviceRoutes.deviceRoute1]);

      const result = await controller.findByRoute('route-id', false);

      expect(service.findByRoute).toHaveBeenCalledWith('route-id', false);
      expect(result.success).toBe(true);
      expect(result.total).toBe(1);
    });
  });

  describe('update', () => {
    it('should update a device route and return success response', async () => {
      const updateDto = { day_assigned: 'tuesday' as const };
      mockDeviceRouteService.update.mockResolvedValue({
        ...testDeviceRoutes.deviceRoute1,
        ...updateDto,
      });

      const result = await controller.update(testDeviceRoutes.deviceRoute1.device_route_id, updateDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Device route updated successfully');
    });
  });

  describe('remove', () => {
    it('should delete a device route and return success response', async () => {
      mockDeviceRouteService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(testDeviceRoutes.deviceRoute1.device_route_id);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Device route deleted successfully');
    });
  });

  describe('removeByRouteId', () => {
    it('should delete all device routes for a route', async () => {
      mockDeviceRouteService.removeAllByRouteId.mockResolvedValue({ affected: 3 });

      const result = await controller.removeByRouteId('route-id');

      expect(result.success).toBe(true);
      expect(result.message).toBe('All device-routes deleted successfully');
      expect(result.affected).toBe(3);
    });

    it('should return message when route has no device routes', async () => {
      mockDeviceRouteService.removeAllByRouteId.mockResolvedValue({ affected: 0 });

      const result = await controller.removeByRouteId('route-id');

      expect(result.success).toBe(true);
      expect(result.affected).toBe(0);
    });
  });

  describe('removeByDeviceId', () => {
    it('should delete all device routes for a device', async () => {
      mockDeviceRouteService.removeAllByDeviceId.mockResolvedValue({ affected: 2 });

      const result = await controller.removeByDeviceId('device-id');

      expect(result.success).toBe(true);
      expect(result.message).toBe('All device-routes deleted successfully');
      expect(result.affected).toBe(2);
    });

    it('should return message when device has no routes', async () => {
      mockDeviceRouteService.removeAllByDeviceId.mockResolvedValue({ affected: 0 });

      const result = await controller.removeByDeviceId('device-id');

      expect(result.success).toBe(true);
      expect(result.affected).toBe(0);
    });
  });
});
