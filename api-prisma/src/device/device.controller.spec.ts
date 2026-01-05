import { Test, TestingModule } from '@nestjs/testing';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { testDevices, createDTOs } from '../test/fixtures';

describe('DeviceController', () => {
  let controller: DeviceController;
  let deviceService: jest.Mocked<DeviceService>;

  const mockDeviceService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByEmployee: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    globalSearch: jest.fn(),
    searchByField: jest.fn(),
    advancedSearch: jest.fn(),
    searchByEmployeeInfo: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeviceController],
      providers: [
        {
          provide: DeviceService,
          useValue: mockDeviceService,
        },
      ],
    }).compile();

    controller = module.get<DeviceController>(DeviceController);
    deviceService = module.get(DeviceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a device and return success response', async () => {
      const createDto = createDTOs.createDevice;
      mockDeviceService.create.mockResolvedValue(testDevices.device1);

      const result = await controller.create(createDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Device created successfully');
      expect(result.data).toEqual(testDevices.device1);
    });
  });

  describe('findAll', () => {
    it('should return all devices with pagination', async () => {
      const devices = [testDevices.device1, testDevices.device2];
      mockDeviceService.findAll.mockResolvedValue({
        data: devices,
        total: 2,
      });

      const result = await controller.findAll({});

      expect(result.success).toBe(true);
      expect(result.message).toBe('Devices retrieved successfully');
      expect(result.data).toEqual(devices);
      expect(result.total).toBe(2);
    });

    it('should apply pagination parameters', async () => {
      mockDeviceService.findAll.mockResolvedValue({
        data: [testDevices.device1],
        total: 10,
      });

      const result = await controller.findAll({ page: 2, limit: 5 });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
      expect(result.totalPages).toBe(2);
    });
  });

  describe('globalSearch', () => {
    it('should perform global search and return results', async () => {
      mockDeviceService.globalSearch.mockResolvedValue([testDevices.device1]);

      const result = await controller.globalSearch('Tablet');

      expect(deviceService.globalSearch).toHaveBeenCalledWith('Tablet');
      expect(result.success).toBe(true);
      expect(result.data).toEqual([testDevices.device1]);
    });
  });

  describe('searchByField', () => {
    it('should search devices by field', async () => {
      mockDeviceService.searchByField.mockResolvedValue([testDevices.device1]);

      const result = await controller.searchByField('device_name', 'Tablet');

      expect(deviceService.searchByField).toHaveBeenCalledWith('device_name', 'Tablet');
      expect(result.success).toBe(true);
      expect(result.data).toEqual([testDevices.device1]);
    });
  });

  describe('advancedSearch', () => {
    it('should perform advanced search with criteria', async () => {
      const criteria = { device_name: 'Tablet', status: 'ACTIVE' };
      mockDeviceService.advancedSearch.mockResolvedValue([testDevices.device1]);

      const result = await controller.advancedSearch(criteria);

      expect(deviceService.advancedSearch).toHaveBeenCalledWith(criteria);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([testDevices.device1]);
    });
  });

  describe('searchByEmployeeInfo', () => {
    it('should search devices by employee information', async () => {
      const criteria = { employee_name: 'Taro' };
      mockDeviceService.searchByEmployeeInfo.mockResolvedValue([testDevices.device1]);

      const result = await controller.searchByEmployeeInfo(criteria);

      expect(deviceService.searchByEmployeeInfo).toHaveBeenCalledWith(criteria);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([testDevices.device1]);
    });
  });

  describe('findOne', () => {
    it('should return a device by ID', async () => {
      mockDeviceService.findOne.mockResolvedValue(testDevices.device1);

      const result = await controller.findOne(testDevices.device1.device_id);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Device retrieved successfully');
      expect(result.data).toEqual(testDevices.device1);
    });
  });

  describe('findByEmployee', () => {
    it('should return devices for an employee', async () => {
      mockDeviceService.findByEmployee.mockResolvedValue([testDevices.device1]);

      const result = await controller.findByEmployee('employee-id');

      expect(deviceService.findByEmployee).toHaveBeenCalledWith('employee-id');
      expect(result.success).toBe(true);
      expect(result.data).toEqual([testDevices.device1]);
    });
  });

  describe('update', () => {
    it('should update a device and return success response', async () => {
      const updateDto = { device_name: 'Updated Device' };
      mockDeviceService.update.mockResolvedValue({
        ...testDevices.device1,
        ...updateDto,
      });

      const result = await controller.update(testDevices.device1.device_id, updateDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Device updated successfully');
    });
  });

  describe('remove', () => {
    it('should delete a device and return success response', async () => {
      mockDeviceService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(testDevices.device1.device_id);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Device deleted successfully');
    });
  });
});
