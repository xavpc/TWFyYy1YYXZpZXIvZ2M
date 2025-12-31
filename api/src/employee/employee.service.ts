import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Employee } from './employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Logger } from '@nestjs/common';
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

  findAll(): Promise<Employee[]> {
    return this.employeeRepository.find();
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
        first_name: 'ASC',
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
        first_name: 'ASC',
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
        first_name: 'ASC',
      },
    });
}



}