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
          `Route with ID ${createDeviceRouteDto.route_id} and device with ID ${createDeviceRouteDto.device_id} is already assigned on ${createDeviceRouteDto.day_assigned}`
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


  async findByRoute(routeId: string, groupByDevice: boolean = false): Promise<DeviceRoute[] | any[]> {
    const deviceRoutes = await this.deviceRouteRepository.find({
      where: { route: { route_id: routeId } },
      relations: ['route', 'device'],
      order: {
        day_assigned: 'ASC' 
      }
    });
    if (!groupByDevice) {
      return deviceRoutes;
    }
    const deviceMap = new Map();
    
    deviceRoutes.forEach(deviceRoute => {
      const deviceId = deviceRoute.device.device_id;
      
      if (!deviceMap.has(deviceId)) {
        deviceMap.set(deviceId, {
          ...deviceRoute,
          day_assigned: [deviceRoute.day_assigned]
        });
      } else {
        const existing = deviceMap.get(deviceId);
        existing.day_assigned.push(deviceRoute.day_assigned);
      }
    });
        
    return Array.from(deviceMap.values()).map(item => ({
      ...item,
      day_assigned: item.day_assigned.join(', ')
    }));
  }

    async removeAllByRouteId(routeId: string): Promise<{ affected: number }> {
      const route = await this.routeRepository.findOne({
        where: { route_id: routeId }
      });
      
      if (!route) {
        throw new NotFoundException(`Route with ID ${routeId} not found`);
      }
    
      const result = await this.deviceRouteRepository
        .createQueryBuilder()
        .delete()
        .from(DeviceRoute)
        .where('route.route_id = :routeId', { routeId })
        .execute();
      
      return { affected: result.affected ?? 0 };
    }


    async removeAllByDeviceId(deviceId: string): Promise<{ affected: number }> {
      const device = await this.deviceRepository.findOne({
        where: { device_id: deviceId }
      });
      
      if (!device) {
        throw new NotFoundException(`Device with ID ${deviceId} not found`);
      }
    
      const result = await this.deviceRouteRepository
        .createQueryBuilder()
        .delete()
        .from(DeviceRoute)
        .where('device.device_id = :deviceId', { deviceId })
        .execute();
      
      return { affected: result.affected ?? 0 };
    }

    
}