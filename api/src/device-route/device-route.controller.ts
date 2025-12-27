import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { DeviceRouteService } from './device-route.service';
import { CreateDeviceRouteDto } from './dto/create-device-route.dto';
import { UpdateDeviceRouteDto } from './dto/update-device-route.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Device Routes(still under development)')
@Controller('web.device-routes')
export class DeviceRouteController {
  constructor(private readonly deviceRouteService: DeviceRouteService) {}

  @Post('')
  async create(@Body() createDeviceRouteDto: CreateDeviceRouteDto) {
    const newDeviceRoute = await this.deviceRouteService.create(createDeviceRouteDto);
    return {
      success: true,
      message: 'Device route created successfully',
      data: newDeviceRoute,
    };
  }

  @Get()
  async findAll() {
    const deviceRoutes = await this.deviceRouteService.findAll();
    return {
      success: true,
      message: 'Device routes retrieved successfully',
      data: deviceRoutes,
      total: deviceRoutes.length,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const deviceRoute = await this.deviceRouteService.findOne(id);
    if (!deviceRoute) {
      throw new NotFoundException(`Device Route with ID ${id} not found`);
    }
    return {
      success: true,
      message: 'Device route retrieved successfully',
      data: deviceRoute,
    };
  }

  @Get('device/:deviceId')
  async findByDevice(@Param('deviceId') deviceId: string) {
    const deviceRoutes = await this.deviceRouteService.findByDevice(deviceId);
    return {
      success: true,
      message: 'Device routes retrieved successfully for the device',
      data: deviceRoutes,
      total: deviceRoutes.length,
    };
  }

  @Get('route/:routeId')
  async findByRoute(@Param('routeId') routeId: string) {
    const deviceRoutes = await this.deviceRouteService.findByRoute(routeId);
    return {
      success: true,
      message: 'Device routes retrieved successfully for the route',
      data: deviceRoutes,
      total: deviceRoutes.length,
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDeviceRouteDto: UpdateDeviceRouteDto) {
    const updatedDeviceRoute = await this.deviceRouteService.update(id, updateDeviceRouteDto);
    return {
      success: true,
      message: 'Device route updated successfully',
      data: updatedDeviceRoute,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.deviceRouteService.remove(id);
    return {
      success: true,
      message: 'Device route deleted successfully',
    };
  }
}