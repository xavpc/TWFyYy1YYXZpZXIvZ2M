import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Device } from './device.entity';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { FilterDeviceDto } from './dto/filter-device.dto';
import { Employee } from 'src/employee/employee.entity';
import { Logger } from '@nestjs/common';

@Injectable()
export class DeviceService {
  // private readonly logger = new Logger(DeviceService.name);
  
  constructor(
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  async create(createDeviceDto: CreateDeviceDto): Promise<Device> {
    const device = this.deviceRepository.create(createDeviceDto);
    
    if (createDeviceDto.employee_id) {
      const employee = await this.employeeRepository.findOne({
        where: { employee_id: createDeviceDto.employee_id }
      });
      
      if (!employee) {
        throw new NotFoundException(
          `Employee with ID ${createDeviceDto.employee_id} not found`
        );
      }
      
      device.employee = employee;
    }

    return this.deviceRepository.save(device);
  }

  async findAll(filterDto?: FilterDeviceDto): Promise<{ data: Device[], total: number }> {
    if (!filterDto) {
      const data = await this.deviceRepository.find({
        relations: ['employee'],
        order: { device_name: 'ASC' }
      });
      return { data, total: data.length };
    }

    const {
      device_name,
      vehicle_plate_num,
      status,
      employee_id,
      search,
      page = 1,
      limit = 10,
      sort_by = 'created_at',
      sort_order = 'ASC'
    } = filterDto;

    const skip = (page - 1) * limit;
    let where: FindOptionsWhere<Device> | FindOptionsWhere<Device>[] = {};

    // Handle global search
    if (search) {
      // Create base search conditions
      const searchConditions: FindOptionsWhere<Device>[] = [
        { device_name: ILike(`%${search}%`) },
        { vehicle_plate_num: ILike(`%${search}%`) },
        { device_id: ILike(`%${search}%`) },
        { employee: { first_name: ILike(`%${search}%`) } },
        { employee: { last_name: ILike(`%${search}%`) } },
        { employee: { email: ILike(`%${search}%`) } },
        { employee: { employee_id: ILike(`%${search}%`) } }
      ];

      // Combine search conditions with additional filters
      where = searchConditions.map(condition => {
        const combinedCondition = { ...condition };
        
        // Apply non-employee filters
        if (device_name) combinedCondition.device_name = ILike(`%${device_name}%`);
        if (vehicle_plate_num) combinedCondition.vehicle_plate_num = ILike(`%${vehicle_plate_num}%`);
        if (status) combinedCondition.status = status;
        
        // Handle employee filter specially
        if (employee_id) {
          if (combinedCondition.employee && typeof combinedCondition.employee === 'object') {
            // If the condition already has employee criteria, merge with employee_id
            combinedCondition.employee = {
              ...(combinedCondition.employee as FindOptionsWhere<Employee>),
              employee_id
            };
          } else {
            // If no existing employee criteria, just set employee_id
            combinedCondition.employee = { employee_id };
          }
        }
        
        return combinedCondition;
      });
    } else {
      // Handle individual field filters when no global search
      const whereCondition: FindOptionsWhere<Device> = {};

      if (device_name) {
        whereCondition.device_name = ILike(`%${device_name}%`);
      }
      if (vehicle_plate_num) {
        whereCondition.vehicle_plate_num = ILike(`%${vehicle_plate_num}%`);
      }
      if (status) {
        whereCondition.status = status;
      }
      if (employee_id) {
        whereCondition.employee = { employee_id };
      }

      where = whereCondition;
    }

    // Get total count
    const total = await this.deviceRepository.count({ 
      where,
      relations: ['employee']
    });

    // Get paginated data with sorting
    const data = await this.deviceRepository.find({
      where,
      relations: ['employee'],
      skip,
      take: limit,
      order: {
        [sort_by]: sort_order,
      },
    });

    return { data, total };
  }

  async findOne(id: string): Promise<Device> {
    const device = await this.deviceRepository.findOne({
      where: { device_id: id },
      relations: ['employee']
    });
    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }
    return device;
  }

  async update(id: string, updateDeviceDto: UpdateDeviceDto): Promise<Device> {
    const device = await this.findOne(id);
    
    // Handle employee assignment update
    if (updateDeviceDto.employee_id) {
      const employee = await this.employeeRepository.findOne({
        where: { employee_id: updateDeviceDto.employee_id }
      });
      
      if (!employee) {
        throw new NotFoundException(
          `Employee with ID ${updateDeviceDto.employee_id} not found`
        );
      }
      
      device.employee = employee;
    }
    
    Object.assign(device, updateDeviceDto);
    return this.deviceRepository.save(device);
  }

  async remove(id: string): Promise<void> {
    const result = await this.deviceRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }
  }

  async findByEmployee(employeeId: string): Promise<Device[]> {
    return this.deviceRepository.find({
      where: { employee: { employee_id: employeeId } },
      relations: ['employee']
    });
  }

  async searchByField(field: keyof Omit<Device, 'employee' | 'device_locations' | 'collected_points' | 'deviceRoutes' | 'complaints'>, value: string): Promise<Device[]> {
    const validSearchFields: (keyof Omit<Device, 'employee' | 'device_locations' | 'collected_points' | 'deviceRoutes' | 'complaints'>)[] = [
      'device_name',
      'vehicle_plate_num',
      'device_id',
      'status'
    ];

    if (!validSearchFields.includes(field)) {
      throw new NotFoundException(`Field ${field} is not a valid searchable field`);
    }

    const where: FindOptionsWhere<Device> = {
      [field]: ILike(`%${value}%`)
    };

    const results = await this.deviceRepository.find({
      where,
      relations: ['employee'],
      order: {
        created_at: 'ASC',
      },
    });

    if (results.length === 0) {
      throw new NotFoundException(`No devices found matching ${field}: ${value}`);
    }

    return results;
  }

  async globalSearch(searchTerm: string): Promise<Device[]> {
    const where: FindOptionsWhere<Device>[] = [
      { device_name: ILike(`%${searchTerm}%`) },
      { vehicle_plate_num: ILike(`%${searchTerm}%`) },
      { device_id: ILike(`%${searchTerm}%`) },
      { employee: { first_name: ILike(`%${searchTerm}%`) } },
      { employee: { last_name: ILike(`%${searchTerm}%`) } },
      { employee: { email: ILike(`%${searchTerm}%`) } },
      { employee: { employee_id: ILike(`%${searchTerm}%`) } }
    ];

    const results = await this.deviceRepository.find({
      where,
      relations: ['employee'],
      order: {
        created_at: 'ASC',
      },
    });

    if (results.length === 0) {
      throw new NotFoundException(`No devices found matching '${searchTerm}'`);
    }

    return results;
  }

  async advancedSearch(criteria: Partial<Record<keyof Omit<Device, 'employee' | 'device_locations' | 'collected_points' | 'deviceRoutes' | 'complaints'>, string>>): Promise<Device[]> {
    const validSearchFields: (keyof Omit<Device, 'employee' | 'device_locations' | 'collected_points' | 'deviceRoutes' | 'complaints'>)[] = [
      'device_name',
      'vehicle_plate_num',
      'device_id',
      'status'
    ];
    
    const where: FindOptionsWhere<Device> = {};

    // this.logger.debug('Original criteria:', criteria);
    // this.logger.debug('Criteria type:', typeof criteria);

    Object.entries(criteria).forEach(([field, value]) => {
      if (validSearchFields.includes(field as keyof Omit<Device, 'employee' | 'device_locations' | 'collected_points' | 'deviceRoutes' | 'complaints'>)) {
        if (field === 'status') {
          where[field] = value as any; // Enum value
        } else {
          where[field] = ILike(`%${value}%`);
        }
        // this.logger.debug(`Added to where clause - ${field}: ${value}`);
      }
    });

    // this.logger.debug('Final where clause:', where);

    return this.deviceRepository.find({
      where,
      relations: ['employee'],
      order: {
        created_at: 'ASC',
      },
    });
  }

  async searchByEmployeeInfo(criteria: { 
    employee_name?: string;
    employee_email?: string;
    employee_id?: string;
  }): Promise<Device[]> {
    const { employee_name, employee_email, employee_id } = criteria;
    let where: FindOptionsWhere<Device>[] = [];

    if (employee_name) {
      where.push(
        { employee: { first_name: ILike(`%${employee_name}%`) } },
        { employee: { last_name: ILike(`%${employee_name}%`) } }
      );
    }

    if (employee_email) {
      where.push(
        { employee: { email: ILike(`%${employee_email}%`) } }
      );
    }

    if (employee_id) {
      where.push(
        { employee: { employee_id: ILike(`%${employee_id}%`) } }
      );
    }

    if (where.length === 0) {
      throw new NotFoundException('No search criteria provided');
    }

    const results = await this.deviceRepository.find({
      where,
      relations: ['employee'],
      order: {
        created_at: 'ASC',
      },
    });

    if (results.length === 0) {
      throw new NotFoundException('No devices found matching the employee criteria');
    }

    return results;
  }
}