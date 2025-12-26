import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Device } from './device.entity';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { Employee } from '../employee/employee.entity';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  async create(createDeviceDto: CreateDeviceDto): Promise<Device> {
    const { employee_ids, ...deviceData } = createDeviceDto;
    const device = this.deviceRepository.create(deviceData);

    if (employee_ids?.length) {
      const employees = await this.employeeRepository.findBy({
        employee_id: In(employee_ids)
      });
      if (employees.length !== employee_ids.length) {
        throw new NotFoundException('One or more employees not found');
      }
      device.employees = employees;
    }

    return this.deviceRepository.save(device);
  }

  findAll(): Promise<Device[]> {
    return this.deviceRepository.find({
      relations: ['employees'],
    });
  }

  async findOne(id: string): Promise<Device> {
    const device = await this.deviceRepository.findOne({
      where: { device_id: id },
      relations: ['employees'],
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }

    return device;
  }

  async update(id: string, updateDeviceDto: UpdateDeviceDto): Promise<Device> {
    const { employee_ids, ...updateData } = updateDeviceDto;
    const device = await this.findOne(id);

    Object.assign(device, updateData);

    if (employee_ids !== undefined) {
      if (employee_ids.length) {
        const employees = await this.employeeRepository.findBy({
          employee_id: In(employee_ids)
        });
        if (employees.length !== employee_ids.length) {
          throw new NotFoundException('One or more employees not found');
        }
        device.employees = employees;
      } else {
        device.employees = [];
      }
    }

    return this.deviceRepository.save(device);
  }

  async remove(id: string): Promise<void> {
    const result = await this.deviceRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }
  }

  async findByPlateNumber(plate: string): Promise<Device> {
    const device = await this.deviceRepository.findOne({
      where: { vehicle_plate_num: plate },
      relations: ['employees'],
    });

    if (!device) {
      throw new NotFoundException(`Device with plate number ${plate} not found`);
    }

    return device;
  }

  async updateStatus(id: string, status: string): Promise<Device> {
    const device = await this.findOne(id);
    device.status = status;
    return this.deviceRepository.save(device);
  }

  async addEmployee(deviceId: string, employeeId: string): Promise<Device> {
    const device = await this.findOne(deviceId);
    const employee = await this.employeeRepository.findOne({
      where: { employee_id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    if (!device.employees) {
      device.employees = [];
    }
    
    device.employees.push(employee);
    return this.deviceRepository.save(device);
  }

  async removeEmployee(deviceId: string, employeeId: string): Promise<Device> {
    const device = await this.findOne(deviceId);
    
    device.employees = device.employees.filter(
      employee => employee.employee_id !== employeeId
    );
    
    return this.deviceRepository.save(device);
  }
}