import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Employee } from './employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Logger } from '@nestjs/common';
import { FilterEmployeeDto } from './dto/filter-employee.dto';
@Injectable()
export class EmployeeService {
  // private readonly logger = new Logger(EmployeeService.name);
  //TODO: handle duplicate response on all service
  //TODO: enhanced searching on all endpoints
  //TODO: auth
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}
  
  create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    const employee = this.employeeRepository.create(createEmployeeDto);
    return this.employeeRepository.save(employee);
  }

  async findAll(filterDto?: FilterEmployeeDto): Promise<{ data: Employee[], total: number }> {
    if (!filterDto) {
      const data = await this.employeeRepository.find({
        order: { first_name: 'ASC' }
      });
      return { data, total: data.length };
    }

    const {
      first_name,
      middle_name,
      last_name,
      email,
      address,
      contact_number,
      age,
      status,
      search,
      page = 1,
      limit = 10,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = filterDto;

    const skip = (page - 1) * limit;
    let where: FindOptionsWhere<Employee> | FindOptionsWhere<Employee>[] = {};

    // Handle global search
    if (search) {
      // Create base search conditions
      const searchConditions: FindOptionsWhere<Employee>[] = [
        { first_name: ILike(`%${search}%`) },
        { middle_name: ILike(`%${search}%`) },
        { last_name: ILike(`%${search}%`) },
        { email: ILike(`%${search}%`) },
        { address: ILike(`%${search}%`) },
        { contact_number: ILike(`%${search}%`) },
        { employee_id: ILike(`%${search}%`) }
      ];

      // Apply additional filters to each search condition
      const additionalFilters: Partial<FindOptionsWhere<Employee>> = {};
      
      if (first_name) additionalFilters.first_name = ILike(`%${first_name}%`);
      if (middle_name) additionalFilters.middle_name = ILike(`%${middle_name}%`);
      if (last_name) additionalFilters.last_name = ILike(`%${last_name}%`);
      if (email) additionalFilters.email = ILike(`%${email}%`);
      if (address) additionalFilters.address = ILike(`%${address}%`);
      if (contact_number) additionalFilters.contact_number = ILike(`%${contact_number}%`);
      if (age !== undefined) additionalFilters.age = age;
      if (status) additionalFilters.status = status;

      // Combine search conditions with additional filters
      where = searchConditions.map(condition => ({
        ...condition,
        ...additionalFilters
      }));
    } else {
      // Handle individual field filters when no global search
      const whereCondition: FindOptionsWhere<Employee> = {};

      if (first_name) {
        whereCondition.first_name = ILike(`%${first_name}%`);
      }
      if (middle_name) {
        whereCondition.middle_name = ILike(`%${middle_name}%`);
      }
      if (last_name) {
        whereCondition.last_name = ILike(`%${last_name}%`);
      }
      if (email) {
        whereCondition.email = ILike(`%${email}%`);
      }
      if (address) {
        whereCondition.address = ILike(`%${address}%`);
      }
      if (contact_number) {
        whereCondition.contact_number = ILike(`%${contact_number}%`);
      }
      if (age !== undefined) {
        whereCondition.age = age;
      }
      if (status) {
        whereCondition.status = status;
      }

      where = whereCondition;
    }

    // Get total count
    const total = await this.employeeRepository.count({ where });

    // Get paginated data with sorting
    const data = await this.employeeRepository.find({
      where,
      skip,
      take: limit,
      order: {
        [sort_by]: sort_order,
      },
    });

    return { data, total };
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({ where: { employee_id: id } });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.findOne(id);
    Object.assign(employee, updateEmployeeDto);
    return this.employeeRepository.save(employee);
  }

  async remove(id: string): Promise<void> {
    const result = await this.employeeRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
  }

  
  async searchByField(field: keyof Omit<Employee, 'devices'>, value: string): Promise<Employee[]> {

    const validSearchFields: (keyof Omit<Employee, 'devices'>)[] = [
      'first_name',
      'middle_name',
      'last_name',
      'email',
      'address',
      'contact_number',
      'age',
      'employee_id'
    ];

    if (!validSearchFields.includes(field)) {
      throw new NotFoundException(`Field ${field} is not a valid searchable field`);
    }

    const where: FindOptionsWhere<Employee> = {
      [field]: ILike(`%${value}%`)
    };

    if (field === 'age' && !isNaN(Number(value))) {
      where.age = Number(value);
    }

    const results = await this.employeeRepository.find({
      where,
      order: {
        created_at: 'DESC',
      },
    });

    if (results.length === 0) {
      throw new NotFoundException(`No employees found matching ${field}: ${value}`);
    }

    return results;
  }

  async globalSearch(searchTerm: string): Promise<Omit<Employee, 'devices'>[]> {
    const searchFields: (keyof Omit<Employee, 'devices'>)[] = [
      'first_name',
      'middle_name',
      'last_name',
      'email',
      'address',
      'contact_number',
      'age',
      'employee_id'
    ];

    const where: FindOptionsWhere<Employee>[] = searchFields.map(field => ({
      [field]: ILike(`%${searchTerm}%`),
    }));
    const results = await this.employeeRepository.find({
      where,
      order: {
        created_at: 'DESC',
      },
    });

    if (results.length === 0) {
      throw new NotFoundException(`No employees found matching '${searchTerm}'`);
    }

    return results 
  }

  async advancedSearch(criteria: Partial<Record<keyof Omit<Employee, 'devices'>, string>>): Promise<Employee[]> {
    const validSearchFields: (keyof Omit<Employee, 'devices'>)[] = [
      'first_name',
      'middle_name',
      'last_name',
      'email',
      'address',
      'contact_number',
      'age',
      'employee_id'
    ];
    
    const where: FindOptionsWhere<Employee> = {};

    // this.logger.debug('Original criteria:', criteria);
    // this.logger.debug('Criteria type:', typeof criteria);

    Object.entries(criteria).forEach(([field, value]) => {
      if (validSearchFields.includes(field as keyof Omit<Employee, 'devices'>)) {
        where[field] = ILike(`%${value}%`);
        // this.logger.debug(`Added to where clause - ${field}: ${value}`);
      }
    });

    // this.logger.debug('Final where clause:', where);

    return this.employeeRepository.find({
      where,
      order: {
        created_at: 'DESC',
      },
    });
}



}