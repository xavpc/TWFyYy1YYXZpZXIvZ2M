import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { DeviceRoute } from './device-route.entity';
import { CreateDeviceRouteDto } from './dto/create-device-route.dto';
import { UpdateDeviceRouteDto } from './dto/update-device-route.dto';
import { Device } from '../device/device.entity';
import { Route } from 'src/route/route.entity';

@Injectable()
export class DeviceRouteService {
  constructor(
    @InjectRepository(DeviceRoute)
    private deviceRouteRepository: Repository<DeviceRoute>,
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
  ) {}

  async create(createDeviceRouteDto: CreateDeviceRouteDto): Promise<DeviceRoute> {

    const device = await this.deviceRepository.findOne({
      where: { device_id: createDeviceRouteDto.device_id }
    });
    
    if (!device) {
      throw new NotFoundException(
        `Device with ID ${createDeviceRouteDto.device_id} not found`
      );
    }
  
    const route = await this.routeRepository.findOne({
      where: { route_id: createDeviceRouteDto.route_id }
    });
    
    if (!route) {
      throw new NotFoundException(
        `Route with ID ${createDeviceRouteDto.route_id} not found`
      );
    }

    const deviceRoute = this.deviceRouteRepository.create({
      device: device,
      route: route,
      day_assigned: createDeviceRouteDto.day_assigned
    });
  
    try {
      return await this.deviceRouteRepository.save(deviceRoute);
    } catch (error) {
      if (error instanceof QueryFailedError && error.message.includes('Duplicate entry')) {
        throw new ConflictException(
          `Route with ID ${createDeviceRouteDto.route_id} is already assigned on ${createDeviceRouteDto.day_assigned}`
        );
      }
      throw error; 
    }
  }

  findAll(): Promise<DeviceRoute[]> {
    return this.deviceRouteRepository.find({
      relations: ['device', 'route']
    });
  }

  async findOne(id: string): Promise<DeviceRoute> {
    const DeviceRoute = await this.deviceRouteRepository.findOne({
      where: { device_route_id: id },
      relations: ['device', 'route']
    });
    if (!DeviceRoute) {
      throw new NotFoundException(`Device Route with ID ${id} not found`);
    }
    return DeviceRoute;
  }

  async update(id: string, updateDeviceRouteDto: UpdateDeviceRouteDto): Promise<DeviceRoute> {
    const DeviceRoute = await this.findOne(id);
    Object.assign(DeviceRoute, updateDeviceRouteDto);
    return this.deviceRouteRepository.save(DeviceRoute);
  }

  async remove(id: string): Promise<void> {
    const result = await this.deviceRouteRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Device Route with ID ${id} not found`);
    }
  }

  findByDevice(deviceId: string): Promise<DeviceRoute[]> {
    return this.deviceRouteRepository.find({
      where: { device: { device_id: deviceId } },
      relations: ['device', 'route']
    });
  }
  findByRoute(routeId: string): Promise<DeviceRoute[]> {
    return this.deviceRouteRepository.find({
      where: { route: { route_id: routeId } },
      relations: ['route','device']
    });
  }
}