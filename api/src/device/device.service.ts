import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from './device.entity';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { Employee } from '../employee/employee.entity';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async create(createDeviceDto: CreateDeviceDto): Promise<Device> {
    const device = this.deviceRepository.create(createDeviceDto);
    
    if (createDeviceDto.employeeId) {
      const employee = await this.employeeRepository.findOne({
        where: { employee_id: createDeviceDto.employeeId }
      });
      
      if (!employee) {
        throw new NotFoundException(
          `Employee with ID ${createDeviceDto.employeeId} not found`
        );
      }
      device.employee = employee;
    }

    return await this.deviceRepository.save(device);
  }

  async findAll(): Promise<Device[]> {
    return await this.deviceRepository.find({
      relations: ['employee'],
    });
  }

  async findOne(device_id: string): Promise<Device> {
    const device = await this.deviceRepository.findOne({
      where: { device_id },
      relations: ['employee'],
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${device_id} not found`);
    }

    return device;
  }

  async findByEmployee(employeeId: string): Promise<Device[]> {
    const employee = await this.employeeRepository.findOne({
      where: { employee_id: employeeId }
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    return await this.deviceRepository.find({
      where: { employee: { employee_id: employeeId } },
      relations: ['employee'],
    });
  }

  async update(device_id: string, updateDeviceDto: UpdateDeviceDto): Promise<Device> {
    const device = await this.findOne(device_id);

    if (updateDeviceDto.employeeId) {
      const employee = await this.employeeRepository.findOne({
        where: { employee_id: updateDeviceDto.employeeId }
      });

      if (!employee) {
        throw new NotFoundException(
          `Employee with ID ${updateDeviceDto.employeeId} not found`
        );
      }
      device.employee = employee;
    }

    Object.assign(device, updateDeviceDto);
    return await this.deviceRepository.save(device);
  }

  async remove(device_id: string): Promise<void> {
    const result = await this.deviceRepository.delete(device_id);
    if (result.affected === 0) {
      throw new NotFoundException(`Device with ID ${device_id} not found`);
    }
  }

  async assignEmployee(device_id: string, employeeId: string): Promise<Device> {
    const device = await this.findOne(device_id);
    const employee = await this.employeeRepository.findOne({
      where: { employee_id: employeeId }
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    device.employee = employee;
    return await this.deviceRepository.save(device);
  }

  async removeEmployee(device_id: string): Promise<Device> {
    const device = await this.findOne(device_id);
    device.employee = null;
    return await this.deviceRepository.save(device);
  }
}