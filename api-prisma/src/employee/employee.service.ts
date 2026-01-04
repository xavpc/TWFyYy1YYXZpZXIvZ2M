import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Employee, Prisma } from '@prisma/client';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { FilterEmployeeDto } from './dto/filter-employee.dto';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    return this.prisma.employee.create({
      data: createEmployeeDto,
    });
  }

  async findAll(filterDto?: FilterEmployeeDto): Promise<{ data: Employee[]; total: number }> {
    if (!filterDto) {
      const data = await this.prisma.employee.findMany({
        orderBy: { first_name: 'asc' },
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
      sort_by = 'updated_at',
      sort_order = 'DESC',
    } = filterDto;

    const skip = (page - 1) * limit;

    // Build where clause
    let where: Prisma.EmployeeWhereInput = {};

    if (search) {
      // Global search across multiple fields
      where = {
        OR: [
          { first_name: { contains: search } },
          { middle_name: { contains: search } },
          { last_name: { contains: search } },
          { email: { contains: search } },
          { address: { contains: search } },
          { contact_number: { contains: search } },
          { employee_id: { contains: search } },
        ],
      };

      // Apply additional filters
      const additionalFilters: Prisma.EmployeeWhereInput = {};
      if (first_name) additionalFilters.first_name = { contains: first_name };
      if (middle_name) additionalFilters.middle_name = { contains: middle_name };
      if (last_name) additionalFilters.last_name = { contains: last_name };
      if (email) additionalFilters.email = { contains: email };
      if (address) additionalFilters.address = { contains: address };
      if (contact_number) additionalFilters.contact_number = { contains: contact_number };
      if (age !== undefined) additionalFilters.age = age;
      if (status) additionalFilters.status = status;

      if (Object.keys(additionalFilters).length > 0) {
        where = { AND: [where, additionalFilters] };
      }
    } else {
      // Individual field filters
      if (first_name) where.first_name = { contains: first_name };
      if (middle_name) where.middle_name = { contains: middle_name };
      if (last_name) where.last_name = { contains: last_name };
      if (email) where.email = { contains: email };
      if (address) where.address = { contains: address };
      if (contact_number) where.contact_number = { contains: contact_number };
      if (age !== undefined) where.age = age;
      if (status) where.status = status;
    }

    // Get total count
    const total = await this.prisma.employee.count();

    // Get paginated data with sorting
    const data = await this.prisma.employee.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sort_by]: sort_order.toLowerCase() as 'asc' | 'desc',
      },
    });

    return { data, total };
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.prisma.employee.findUnique({
      where: { employee_id: id },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    // Check if employee exists
    await this.findOne(id);

    return this.prisma.employee.update({
      where: { employee_id: id },
      data: updateEmployeeDto,
    });
  }

  async remove(id: string): Promise<void> {
    // Check if employee exists
    await this.findOne(id);

    await this.prisma.employee.delete({
      where: { employee_id: id },
    });
  }

  async searchByField(
    field: keyof Omit<Employee, 'devices' | 'user'>,
    value: string,
  ): Promise<Employee[]> {
    const validSearchFields: (keyof Omit<Employee, 'devices' | 'user'>)[] = [
      'first_name',
      'middle_name',
      'last_name',
      'email',
      'address',
      'contact_number',
      'age',
      'employee_id',
    ];

    if (!validSearchFields.includes(field)) {
      throw new NotFoundException(`Field ${field} is not a valid searchable field`);
    }

    let where: Prisma.EmployeeWhereInput = {};

    if (field === 'age' && !isNaN(Number(value))) {
      where = { age: Number(value) };
    } else {
      where = { [field]: { contains: value } };
    }

    const results = await this.prisma.employee.findMany({
      where,
      orderBy: { updated_at: 'desc' },
    });

    if (results.length === 0) {
      throw new NotFoundException(`No employees found matching ${field}: ${value}`);
    }

    return results;
  }

  async globalSearch(searchTerm: string): Promise<Employee[]> {
    const results = await this.prisma.employee.findMany({
      where: {
        OR: [
          { first_name: { contains: searchTerm } },
          { middle_name: { contains: searchTerm } },
          { last_name: { contains: searchTerm } },
          { email: { contains: searchTerm } },
          { address: { contains: searchTerm } },
          { contact_number: { contains: searchTerm } },
          { employee_id: { contains: searchTerm } },
        ],
      },
      orderBy: { updated_at: 'desc' },
    });

    if (results.length === 0) {
      throw new NotFoundException(`No employees found matching '${searchTerm}'`);
    }

    return results;
  }

  async advancedSearch(
    criteria: Partial<Record<keyof Omit<Employee, 'devices' | 'user'>, string>>,
  ): Promise<Employee[]> {
    const validSearchFields: (keyof Omit<Employee, 'devices' | 'user'>)[] = [
      'first_name',
      'middle_name',
      'last_name',
      'email',
      'address',
      'contact_number',
      'age',
      'employee_id',
    ];

    const where: Prisma.EmployeeWhereInput = {};

    Object.entries(criteria).forEach(([field, value]) => {
      if (validSearchFields.includes(field as keyof Omit<Employee, 'devices' | 'user'>)) {
        if (field === 'age') {
          where[field] = Number(value);
        } else {
          where[field] = { contains: value };
        }
      }
    });

    return this.prisma.employee.findMany({
      where,
      orderBy: { updated_at: 'desc' },
    });
  }
}
