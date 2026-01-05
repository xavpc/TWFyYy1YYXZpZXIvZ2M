import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Device, Prisma } from '@prisma/client';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { FilterDeviceDto } from './dto/filter-device.dto';

@Injectable()
export class DeviceService {
  constructor(private prisma: PrismaService) {}

  async create(createDeviceDto: CreateDeviceDto): Promise<Device> {
    // Verify employee exists
    if (createDeviceDto.employee_id) {
      const employee = await this.prisma.employee.findUnique({
        where: { employee_id: createDeviceDto.employee_id },
      });

      if (!employee) {
        throw new NotFoundException(
          `Employee with ID ${createDeviceDto.employee_id} not found`,
        );
      }
    }

    return this.prisma.device.create({
      data: {
        device_name: createDeviceDto.device_name,
        vehicle_plate_num: createDeviceDto.vehicle_plate_num,
        employee: {
          connect: { employee_id: createDeviceDto.employee_id },
        },
      },
      include: { employee: true },
    });
  }

  async findAll(filterDto?: FilterDeviceDto): Promise<{ data: Device[]; total: number }> {
    if (!filterDto) {
      const data = await this.prisma.device.findMany({
        include: { employee: true },
        orderBy: { device_name: 'asc' },
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
      sort_by = 'updated_at',
      sort_order = 'ASC',
    } = filterDto;

    const skip = (page - 1) * limit;

    // Build where clause
    let where: Prisma.DeviceWhereInput = {};

    if (search) {
      // Global search across multiple fields
      where = {
        OR: [
          { device_name: { contains: search } },
          { vehicle_plate_num: { contains: search } },
          { device_id: { contains: search } },
          { employee: { first_name: { contains: search } } },
          { employee: { last_name: { contains: search } } },
          { employee: { email: { contains: search } } },
          { employee: { employee_id: { contains: search } } },
        ],
      };

      // Apply additional filters
      const additionalFilters: Prisma.DeviceWhereInput = {};
      if (device_name) additionalFilters.device_name = { contains: device_name };
      if (vehicle_plate_num) additionalFilters.vehicle_plate_num = { contains: vehicle_plate_num };
      if (status) additionalFilters.status = status;
      if (employee_id) additionalFilters.employee_id = employee_id;

      if (Object.keys(additionalFilters).length > 0) {
        where = { AND: [where, additionalFilters] };
      }
    } else {
      // Individual field filters
      if (device_name) where.device_name = { contains: device_name };
      if (vehicle_plate_num) where.vehicle_plate_num = { contains: vehicle_plate_num };
      if (status) where.status = status;
      if (employee_id) where.employee_id = employee_id;
    }

    // Get total count
    const total = await this.prisma.device.count();

    const data = await this.prisma.device.findMany({
      where,
      include: { employee: true },
      skip,
      take: limit,
      orderBy: {
        [sort_by]: sort_order.toLowerCase() as 'asc' | 'desc',
      },
    });

    return { data, total };
  }

  async findOne(id: string): Promise<Device> {
    const device = await this.prisma.device.findUnique({
      where: { device_id: id },
      include: { employee: true },
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }

    return device;
  }

  async update(id: string, updateDeviceDto: UpdateDeviceDto): Promise<Device> {
    // Check if device exists
    await this.findOne(id);

    // Handle employee assignment update
    if (updateDeviceDto.employee_id) {
      const employee = await this.prisma.employee.findUnique({
        where: { employee_id: updateDeviceDto.employee_id },
      });

      if (!employee) {
        throw new NotFoundException(
          `Employee with ID ${updateDeviceDto.employee_id} not found`,
        );
      }
    }

    const { employee_id, ...otherData } = updateDeviceDto;

    return this.prisma.device.update({
      where: { device_id: id },
      data: {
        ...otherData,
        ...(employee_id && {
          employee: { connect: { employee_id } },
        }),
      },
      include: { employee: true },
    });
  }

  async remove(id: string): Promise<void> {
    // Check if device exists
    await this.findOne(id);

    await this.prisma.device.delete({
      where: { device_id: id },
    });
  }

  async findByEmployee(employeeId: string): Promise<Device[]> {
    return this.prisma.device.findMany({
      where: { employee_id: employeeId },
      include: { employee: true },
    });
  }

  async searchByField(
    field: keyof Omit<Device, 'employee' | 'device_locations' | 'collected_points' | 'device_routes' | 'complaints'>,
    value: string,
  ): Promise<Device[]> {
    const validSearchFields = ['device_name', 'vehicle_plate_num', 'device_id', 'status'];

    if (!validSearchFields.includes(field)) {
      throw new NotFoundException(`Field ${field} is not a valid searchable field`);
    }

    let where: Prisma.DeviceWhereInput = {};

    if (field === 'status') {
      where = { [field]: value as any };
    } else {
      where = { [field]: { contains: value } };
    }

    const results = await this.prisma.device.findMany({
      where,
      include: { employee: true },
      orderBy: { updated_at: 'asc' },
    });

    if (results.length === 0) {
      throw new NotFoundException(`No devices found matching ${field}: ${value}`);
    }

    return results;
  }

  async globalSearch(searchTerm: string): Promise<Device[]> {
    const results = await this.prisma.device.findMany({
      where: {
        OR: [
          { device_name: { contains: searchTerm } },
          { vehicle_plate_num: { contains: searchTerm } },
          { device_id: { contains: searchTerm } },
          { employee: { first_name: { contains: searchTerm } } },
          { employee: { last_name: { contains: searchTerm } } },
          { employee: { email: { contains: searchTerm } } },
          { employee: { employee_id: { contains: searchTerm } } },
        ],
      },
      include: { employee: true },
      orderBy: { updated_at: 'asc' },
    });

    return results;
  }

  async advancedSearch(
    criteria: Partial<Record<string, string>>,
  ): Promise<Device[]> {
    const validSearchFields = ['device_name', 'vehicle_plate_num', 'device_id', 'status'];

    const where: Prisma.DeviceWhereInput = {};

    Object.entries(criteria).forEach(([field, value]) => {
      if (validSearchFields.includes(field)) {
        if (field === 'status') {
          where[field] = value as any;
        } else {
          where[field] = { contains: value };
        }
      }
    });

    return this.prisma.device.findMany({
      where,
      include: { employee: true },
      orderBy: { updated_at: 'asc' },
    });
  }

  async searchByEmployeeInfo(criteria: {
    employee_name?: string;
    employee_email?: string;
    employee_id?: string;
  }): Promise<Device[]> {
    const { employee_name, employee_email, employee_id } = criteria;
    const orConditions: Prisma.DeviceWhereInput[] = [];

    if (employee_name) {
      orConditions.push(
        { employee: { first_name: { contains: employee_name } } },
        { employee: { last_name: { contains: employee_name } } },
      );
    }

    if (employee_email) {
      orConditions.push({ employee: { email: { contains: employee_email } } });
    }

    if (employee_id) {
      orConditions.push({ employee: { employee_id: { contains: employee_id } } });
    }

    if (orConditions.length === 0) {
      throw new NotFoundException('No search criteria provided');
    }

    const results = await this.prisma.device.findMany({
      where: { OR: orConditions },
      include: { employee: true },
      orderBy: { updated_at: 'asc' },
    });

    if (results.length === 0) {
      throw new NotFoundException('No devices found matching the employee criteria');
    }

    return results;
  }
}
