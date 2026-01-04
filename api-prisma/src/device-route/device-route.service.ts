import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeviceRoute, Prisma, DeviceRouteDay } from '@prisma/client';
import { CreateDeviceRouteDto } from './dto/create-device-route.dto';
import { UpdateDeviceRouteDto } from './dto/update-device-route.dto';

@Injectable()
export class DeviceRouteService {
  constructor(private prisma: PrismaService) { }

  async create(createDeviceRouteDto: CreateDeviceRouteDto): Promise<DeviceRoute> {
    const device = await this.prisma.device.findUnique({
      where: { device_id: createDeviceRouteDto.device_id }
    });

    if (!device) {
      throw new NotFoundException(
        `Device with ID ${createDeviceRouteDto.device_id} not found`
      );
    }

    const route = await this.prisma.route.findUnique({
      where: { route_id: createDeviceRouteDto.route_id }
    });

    if (!route) {
      throw new NotFoundException(
        `Route with ID ${createDeviceRouteDto.route_id} not found`
      );
    }

    try {
      return await this.prisma.deviceRoute.create({
        data: {
          device_id: createDeviceRouteDto.device_id,
          route_id: createDeviceRouteDto.route_id,
          day_assigned: createDeviceRouteDto.day_assigned as DeviceRouteDay
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `Route with ID ${createDeviceRouteDto.route_id} and device with ID ${createDeviceRouteDto.device_id} is already assigned on ${createDeviceRouteDto.day_assigned}`
          );
        }
      }
      throw error;
    }
  }

  findAll(): Promise<DeviceRoute[]> {
    return this.prisma.deviceRoute.findMany({
      include: {
        device: true,
        route: true
      }
    });
  }

  async findOne(id: string): Promise<DeviceRoute & { device: any; route: any }> {
    const deviceRoute = await this.prisma.deviceRoute.findUnique({
      where: { device_route_id: id },
      include: {
        device: true,
        route: true
      }
    });
    if (!deviceRoute) {
      throw new NotFoundException(`Device Route with ID ${id} not found`);
    }
    return deviceRoute;
  }

  async update(id: string, updateDeviceRouteDto: UpdateDeviceRouteDto): Promise<DeviceRoute> {
    await this.findOne(id);

    return this.prisma.deviceRoute.update({
      where: { device_route_id: id },
      data: updateDeviceRouteDto
    });
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.deviceRoute.delete({
        where: { device_route_id: id }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Device Route with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  findByDevice(deviceId: string): Promise<DeviceRoute[]> {
    return this.prisma.deviceRoute.findMany({
      where: { device_id: deviceId },
      include: {
        device: true,
        route: true
      }
    });
  }


  async findByRoute(routeId: string, groupByDevice: boolean = false): Promise<DeviceRoute[] | any[]> {
    const deviceRoutes = await this.prisma.deviceRoute.findMany({
      where: { route_id: routeId },
      include: {
        route: true,
        device: true
      },
      orderBy: {
        day_assigned: 'asc'
      }
    });

    if (!groupByDevice) {
      return deviceRoutes;
    }

    const deviceMap = new Map();

    deviceRoutes.forEach(deviceRoute => {
      const deviceId = deviceRoute.device_id;

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
    const route = await this.prisma.route.findUnique({
      where: { route_id: routeId }
    });

    if (!route) {
      throw new NotFoundException(`Route with ID ${routeId} not found`);
    }

    const result = await this.prisma.deviceRoute.deleteMany({
      where: { route_id: routeId }
    });

    return { affected: result.count };
  }


  async removeAllByDeviceId(deviceId: string): Promise<{ affected: number }> {
    const device = await this.prisma.device.findUnique({
      where: { device_id: deviceId }
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }

    const result = await this.prisma.deviceRoute.deleteMany({
      where: { device_id: deviceId }
    });

    return { affected: result.count };
  }
}
