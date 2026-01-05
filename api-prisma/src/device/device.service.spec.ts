import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeviceService } from './device.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrismaService, resetPrismaMocks } from '../test/mocks/prisma.mock';
import { testDevices, testEmployees, createDTOs } from '../test/fixtures';

describe('DeviceService', () => {
  let service: DeviceService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    resetPrismaMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeviceService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DeviceService>(DeviceService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create device with valid data', async () => {
      const createDto = createDTOs.createDevice;
      prisma.employee.findUnique.mockResolvedValue(testEmployees.employee1);
      prisma.device.create.mockResolvedValue({
        ...testDevices.device1,
        ...createDto,
      });

      const result = await service.create(createDto);

      expect(prisma.device.create).toHaveBeenCalled();
      expect(result.device_name).toBe(createDto.device_name);
    });

    it('should throw NotFoundException when employee not found', async () => {
      prisma.employee.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          device_name: 'Test',
          vehicle_plate_num: 'TEST-123',
          employee_id: 'nonexistent-id',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all devices without filter', async () => {
      const devices = [testDevices.device1, testDevices.device2];
      prisma.device.findMany.mockResolvedValue(devices);

      const result = await service.findAll();

      expect(result.data).toEqual(devices);
      expect(result.total).toBe(devices.length);
    });

    it('should apply pagination', async () => {
      prisma.device.findMany.mockResolvedValue([testDevices.device1]);
      prisma.device.count.mockResolvedValue(10);

      await service.findAll({ page: 2, limit: 5 });

      expect(prisma.device.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        }),
      );
    });

    it('should filter by status', async () => {
      prisma.device.findMany.mockResolvedValue([testDevices.device1]);
      prisma.device.count.mockResolvedValue(1);

      await service.findAll({ status: 'active' });

      expect(prisma.device.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'active' }),
        }),
      );
    });

    it('should apply global search', async () => {
      prisma.device.findMany.mockResolvedValue([]);
      prisma.device.count.mockResolvedValue(0);

      await service.findAll({ search: 'Truck' });

      expect(prisma.device.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { device_name: { contains: 'Truck' } },
            ]),
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return device by ID', async () => {
      prisma.device.findUnique.mockResolvedValue(testDevices.device1);

      const result = await service.findOne(testDevices.device1.device_id);

      expect(result).toEqual(testDevices.device1);
    });

    it('should throw NotFoundException for invalid ID', async () => {
      prisma.device.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update device details', async () => {
      const updateDto = { device_name: 'Updated-Truck' };
      prisma.device.findUnique.mockResolvedValue(testDevices.device1);
      prisma.device.update.mockResolvedValue({
        ...testDevices.device1,
        ...updateDto,
      });

      const result = await service.update(testDevices.device1.device_id, updateDto);

      expect(result.device_name).toBe('Updated-Truck');
    });

    it('should change employee assignment', async () => {
      const updateDto = { employee_id: testEmployees.employee2.employee_id };
      prisma.device.findUnique.mockResolvedValue(testDevices.device1);
      prisma.employee.findUnique.mockResolvedValue(testEmployees.employee2);
      prisma.device.update.mockResolvedValue({
        ...testDevices.device1,
        employee_id: updateDto.employee_id,
      });

      await service.update(testDevices.device1.device_id, updateDto);

      expect(prisma.device.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            employee: { connect: { employee_id: updateDto.employee_id } },
          }),
        }),
      );
    });

    it('should throw NotFoundException when new employee not found', async () => {
      prisma.device.findUnique.mockResolvedValue(testDevices.device1);
      prisma.employee.findUnique.mockResolvedValue(null);

      await expect(
        service.update(testDevices.device1.device_id, {
          employee_id: 'nonexistent-id',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete device', async () => {
      prisma.device.findUnique.mockResolvedValue(testDevices.device1);
      prisma.device.delete.mockResolvedValue(testDevices.device1);

      await service.remove(testDevices.device1.device_id);

      expect(prisma.device.delete).toHaveBeenCalledWith({
        where: { device_id: testDevices.device1.device_id },
      });
    });

    it('should throw NotFoundException for invalid ID', async () => {
      prisma.device.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEmployee', () => {
    it('should return devices for employee', async () => {
      const devices = [testDevices.device1];
      prisma.device.findMany.mockResolvedValue(devices);

      const result = await service.findByEmployee(testEmployees.employee1.employee_id);

      expect(result).toEqual(devices);
      expect(prisma.device.findMany).toHaveBeenCalledWith({
        where: { employee_id: testEmployees.employee1.employee_id },
        include: { employee: true },
      });
    });

    it('should return empty array when no devices', async () => {
      prisma.device.findMany.mockResolvedValue([]);

      const result = await service.findByEmployee('no-devices-employee');

      expect(result).toEqual([]);
    });
  });

  describe('searchByField', () => {
    it('should search by device_name', async () => {
      prisma.device.findMany.mockResolvedValue([testDevices.device1]);

      const result = await service.searchByField('device_name', 'Truck');

      expect(result).toHaveLength(1);
    });

    it('should search by vehicle_plate_num', async () => {
      prisma.device.findMany.mockResolvedValue([testDevices.device1]);

      const result = await service.searchByField('vehicle_plate_num', 'ABC');

      expect(result).toHaveLength(1);
    });

    it('should throw NotFoundException for invalid field', async () => {
      await expect(
        service.searchByField('invalid_field' as any, 'value'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when no results', async () => {
      prisma.device.findMany.mockResolvedValue([]);

      await expect(
        service.searchByField('device_name', 'NonExistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('globalSearch', () => {
    it('should search across all fields', async () => {
      prisma.device.findMany.mockResolvedValue([testDevices.device1]);

      const result = await service.globalSearch('Truck');

      expect(result).toHaveLength(1);
      expect(prisma.device.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: expect.arrayContaining([
              { device_name: { contains: 'Truck' } },
              { vehicle_plate_num: { contains: 'Truck' } },
            ]),
          },
        }),
      );
    });

    it('should return empty array when no results', async () => {
      prisma.device.findMany.mockResolvedValue([]);

      const result = await service.globalSearch('nonexistent');

      expect(result).toEqual([]);
    });
  });

  describe('advancedSearch', () => {
    it('should combine criteria', async () => {
      prisma.device.findMany.mockResolvedValue([testDevices.device1]);

      const result = await service.advancedSearch({
        device_name: 'Truck',
        status: 'active',
      });

      expect(result).toHaveLength(1);
    });

    it('should return empty array when no matches', async () => {
      prisma.device.findMany.mockResolvedValue([]);

      const result = await service.advancedSearch({ device_name: 'NoMatch' });

      expect(result).toEqual([]);
    });
  });

  describe('searchByEmployeeInfo', () => {
    it('should search by employee name', async () => {
      prisma.device.findMany.mockResolvedValue([testDevices.device1]);

      const result = await service.searchByEmployeeInfo({
        employee_name: 'Taro',
      });

      expect(result).toHaveLength(1);
    });

    it('should search by employee email', async () => {
      prisma.device.findMany.mockResolvedValue([testDevices.device1]);

      const result = await service.searchByEmployeeInfo({
        employee_email: 'taro@test.com',
      });

      expect(result).toHaveLength(1);
    });

    it('should throw NotFoundException when no criteria provided', async () => {
      await expect(service.searchByEmployeeInfo({})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when no results', async () => {
      prisma.device.findMany.mockResolvedValue([]);

      await expect(
        service.searchByEmployeeInfo({ employee_name: 'NonExistent' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
