import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrismaService, resetPrismaMocks } from '../test/mocks/prisma.mock';
import { testEmployees, createDTOs } from '../test/fixtures';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    resetPrismaMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create employee with valid data', async () => {
      const createDto = createDTOs.createEmployee;
      prisma.employee.create.mockResolvedValue({
        ...testEmployees.employee1,
        ...createDto,
      });

      const result = await service.create(createDto);

      expect(prisma.employee.create).toHaveBeenCalledWith({
        data: createDto,
      });
      expect(result.first_name).toBe(createDto.first_name);
    });
  });

  describe('findAll', () => {
    it('should return all employees without filter', async () => {
      const employees = [testEmployees.employee1, testEmployees.employee2];
      prisma.employee.findMany.mockResolvedValue(employees);

      const result = await service.findAll();

      expect(result.data).toEqual(employees);
      expect(result.total).toBe(employees.length);
    });

    it('should apply pagination correctly', async () => {
      const employees = [testEmployees.employee1];
      prisma.employee.findMany.mockResolvedValue(employees);
      prisma.employee.count.mockResolvedValue(10);

      const result = await service.findAll({ page: 2, limit: 5 });

      expect(prisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        }),
      );
      expect(result.total).toBe(10);
    });

    it('should apply sorting correctly', async () => {
      prisma.employee.findMany.mockResolvedValue([]);
      prisma.employee.count.mockResolvedValue(0);

      await service.findAll({ sort_by: 'first_name', sort_order: 'ASC' });

      expect(prisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { first_name: 'asc' },
        }),
      );
    });

    it('should filter by status', async () => {
      prisma.employee.findMany.mockResolvedValue([testEmployees.employee1]);
      prisma.employee.count.mockResolvedValue(1);

      await service.findAll({ status: 'active' });

      expect(prisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'active' }),
        }),
      );
    });

    it('should apply global search correctly', async () => {
      prisma.employee.findMany.mockResolvedValue([]);
      prisma.employee.count.mockResolvedValue(0);

      await service.findAll({ search: 'Taro' });

      expect(prisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { first_name: { contains: 'Taro' } },
            ]),
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return employee by ID', async () => {
      prisma.employee.findUnique.mockResolvedValue(testEmployees.employee1);

      const result = await service.findOne(testEmployees.employee1.employee_id);

      expect(result).toEqual(testEmployees.employee1);
    });

    it('should throw NotFoundException for invalid ID', async () => {
      prisma.employee.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update employee details', async () => {
      const updateDto = { first_name: 'Updated' };
      prisma.employee.findUnique.mockResolvedValue(testEmployees.employee1);
      prisma.employee.update.mockResolvedValue({
        ...testEmployees.employee1,
        ...updateDto,
      });

      const result = await service.update(
        testEmployees.employee1.employee_id,
        updateDto,
      );

      expect(result.first_name).toBe('Updated');
    });

    it('should throw NotFoundException for invalid ID', async () => {
      prisma.employee.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent-id', { first_name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete employee by ID', async () => {
      prisma.employee.findUnique.mockResolvedValue(testEmployees.employee1);
      prisma.employee.delete.mockResolvedValue(testEmployees.employee1);

      await service.remove(testEmployees.employee1.employee_id);

      expect(prisma.employee.delete).toHaveBeenCalledWith({
        where: { employee_id: testEmployees.employee1.employee_id },
      });
    });

    it('should throw NotFoundException for invalid ID', async () => {
      prisma.employee.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('searchByField', () => {
    it('should search by name field', async () => {
      prisma.employee.findMany.mockResolvedValue([testEmployees.employee1]);

      const result = await service.searchByField('first_name', 'Taro');

      expect(result).toHaveLength(1);
      expect(prisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { first_name: { contains: 'Taro' } },
        }),
      );
    });

    it('should search by email field', async () => {
      prisma.employee.findMany.mockResolvedValue([testEmployees.employee1]);

      const result = await service.searchByField('email', 'taro');

      expect(result).toHaveLength(1);
    });

    it('should search by age field with number conversion', async () => {
      prisma.employee.findMany.mockResolvedValue([testEmployees.employee1]);

      await service.searchByField('age', '35');

      expect(prisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { age: 35 },
        }),
      );
    });

    it('should throw NotFoundException for invalid field', async () => {
      await expect(
        service.searchByField('invalid_field' as any, 'value'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when no results found', async () => {
      prisma.employee.findMany.mockResolvedValue([]);

      await expect(
        service.searchByField('first_name', 'NonExistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('globalSearch', () => {
    it('should search across all fields', async () => {
      prisma.employee.findMany.mockResolvedValue([
        testEmployees.employee1,
        testEmployees.employee2,
      ]);

      const result = await service.globalSearch('test');

      expect(result).toHaveLength(2);
      expect(prisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: expect.arrayContaining([
              { first_name: { contains: 'test' } },
              { last_name: { contains: 'test' } },
              { email: { contains: 'test' } },
            ]),
          },
        }),
      );
    });

    it('should throw NotFoundException when no results', async () => {
      prisma.employee.findMany.mockResolvedValue([]);

      await expect(service.globalSearch('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('advancedSearch', () => {
    it('should combine multiple search criteria', async () => {
      prisma.employee.findMany.mockResolvedValue([testEmployees.employee1]);

      const result = await service.advancedSearch({
        first_name: 'Taro',
        email: 'test',
      });

      expect(result).toHaveLength(1);
      expect(prisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            first_name: { contains: 'Taro' },
            email: { contains: 'test' },
          }),
        }),
      );
    });

    it('should handle age as number in advanced search', async () => {
      prisma.employee.findMany.mockResolvedValue([testEmployees.employee1]);

      await service.advancedSearch({ age: '35' });

      expect(prisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            age: 35,
          }),
        }),
      );
    });

    it('should return empty array when no matches', async () => {
      prisma.employee.findMany.mockResolvedValue([]);

      const result = await service.advancedSearch({ first_name: 'NoMatch' });

      expect(result).toEqual([]);
    });
  });
});
