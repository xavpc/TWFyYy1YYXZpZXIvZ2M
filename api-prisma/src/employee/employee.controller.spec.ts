import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { testEmployees, createDTOs } from '../test/fixtures';

describe('EmployeeController', () => {
  let controller: EmployeeController;
  let employeeService: jest.Mocked<EmployeeService>;

  const mockEmployeeService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    searchByField: jest.fn(),
    globalSearch: jest.fn(),
    advancedSearch: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeController],
      providers: [
        {
          provide: EmployeeService,
          useValue: mockEmployeeService,
        },
      ],
    }).compile();

    controller = module.get<EmployeeController>(EmployeeController);
    employeeService = module.get(EmployeeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an employee and return success response', async () => {
      const createDto = createDTOs.createEmployee;
      mockEmployeeService.create.mockResolvedValue(testEmployees.employee1);

      const result = await controller.create(createDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Employee created successfully');
      expect(result.data).toEqual(testEmployees.employee1);
    });
  });

  describe('findAll', () => {
    it('should return all employees with pagination info', async () => {
      const employees = [testEmployees.employee1, testEmployees.employee2];
      mockEmployeeService.findAll.mockResolvedValue({
        data: employees,
        total: 2,
      });

      const result = await controller.findAll({});

      expect(result.success).toBe(true);
      expect(result.data).toEqual(employees);
      expect(result.total).toBe(2);
    });

    it('should apply pagination parameters', async () => {
      mockEmployeeService.findAll.mockResolvedValue({
        data: [testEmployees.employee1],
        total: 10,
      });

      const result = await controller.findAll({ page: 1, limit: 1 });

      expect(result.page).toBe(1);
      expect(result.limit).toBe(1);
      expect(result.totalPages).toBe(10);
    });
  });

  describe('searchByField', () => {
    it('should search employees by field', async () => {
      mockEmployeeService.searchByField.mockResolvedValue([testEmployees.employee1]);

      const result = await controller.searchByField('first_name', 'Taro');

      expect(employeeService.searchByField).toHaveBeenCalledWith('first_name', 'Taro');
      expect(result).toEqual([testEmployees.employee1]);
    });
  });

  describe('globalSearch', () => {
    it('should perform global search', async () => {
      mockEmployeeService.globalSearch.mockResolvedValue([testEmployees.employee1]);

      const result = await controller.globalSearch('Taro');

      expect(employeeService.globalSearch).toHaveBeenCalledWith('Taro');
      expect(result).toEqual([testEmployees.employee1]);
    });

    it('should throw BadRequestException when search term is empty', async () => {
      await expect(controller.globalSearch('')).rejects.toThrow(BadRequestException);
    });
  });

  describe('advancedSearch', () => {
    it('should perform advanced search with valid criteria', async () => {
      const criteria = { first_name: 'Taro' };
      mockEmployeeService.advancedSearch.mockResolvedValue([testEmployees.employee1]);

      const result = await controller.advancedSearch(JSON.stringify(criteria));

      expect(employeeService.advancedSearch).toHaveBeenCalledWith(criteria);
      expect(result).toEqual([testEmployees.employee1]);
    });

    it('should throw BadRequestException for invalid JSON', async () => {
      await expect(controller.advancedSearch('invalid-json')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should update an employee and return success response', async () => {
      const updateDto = { first_name: 'Updated' };
      mockEmployeeService.update.mockResolvedValue({
        ...testEmployees.employee1,
        ...updateDto,
      });

      const result = await controller.update(testEmployees.employee1.employee_id, updateDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Employee updated successfully');
    });
  });

  describe('remove', () => {
    it('should delete an employee and return success response', async () => {
      mockEmployeeService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(testEmployees.employee1.employee_id);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Employee deleted successfully');
    });
  });
});
