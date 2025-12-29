import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { DeviceRouteService } from './device-route.service';
import { CreateDeviceRouteDto } from './dto/create-device-route.dto';
import { UpdateDeviceRouteDto } from './dto/update-device-route.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { DeviceRouteResponse, DeviceRouteListResponse, DeviceRouteErrorResponse } from './dto/response.dto';

@ApiTags('Device Routes')
@Controller('device-routes')
export class DeviceRouteController {
  constructor(private readonly deviceRouteService: DeviceRouteService) {}

  @Post('')
  @ApiOperation({ summary: 'Create a new device route' })
  @ApiBody({ type: CreateDeviceRouteDto, description: 'Device route data to create' })
  @ApiResponse({
    status: 201,
    description: 'Device route created successfully',
    type: DeviceRouteResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
    type: DeviceRouteErrorResponse,
  })
  async create(@Body() createDeviceRouteDto: CreateDeviceRouteDto) {
    const newDeviceRoute = await this.deviceRouteService.create(createDeviceRouteDto);
    return {
      success: true,
      message: 'Device route created successfully',
      data: newDeviceRoute,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all device routes' })
  @ApiResponse({
    status: 200,
    description: 'Device routes retrieved successfully',
    type: DeviceRouteListResponse,
  })
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
  @ApiOperation({ summary: 'Get a device route by ID' })
  @ApiParam({ name: 'id', description: 'Device route ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Device route retrieved successfully',
    type: DeviceRouteResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Device route not found',
    type: DeviceRouteErrorResponse,
  })
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
  @ApiTags('FOR MOBILE USE')
  @ApiOperation({ summary: 'Get all device routes for a specific device' })
  @ApiParam({ name: 'deviceId', description: 'Device ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Device routes retrieved successfully',
    type: DeviceRouteListResponse,
  })
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
  @ApiOperation({ summary: 'Get all device routes for a specific route' })
  @ApiParam({ name: 'routeId', description: 'Route ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Device routes retrieved successfully',
    type: DeviceRouteListResponse,
  })
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
  @ApiOperation({ summary: 'Update a device route' })
  @ApiParam({ name: 'id', description: 'Device route ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ type: CreateDeviceRouteDto, description: 'Device route data to update' })
  @ApiResponse({
    status: 200,
    description: 'Device route updated successfully',
    type: DeviceRouteResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Device route not found',
    type: DeviceRouteErrorResponse,
  })
  async update(@Param('id') id: string, @Body() updateDeviceRouteDto: UpdateDeviceRouteDto) {
    const updatedDeviceRoute = await this.deviceRouteService.update(id, updateDeviceRouteDto);
    return {
      success: true,
      message: 'Device route updated successfully',
      data: updatedDeviceRoute,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a device route' })
  @ApiParam({ name: 'id', description: 'Device route ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Device route deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Device route deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Device route not found',
    type: DeviceRouteErrorResponse,
  })
  async remove(@Param('id') id: string) {
    await this.deviceRouteService.remove(id);
    return {
      success: true,
      message: 'Device route deleted successfully',
    };
  }



      @Delete('route/:routeId')
      @ApiOperation({ summary: 'Delete all device-route for a specific route' })
      @ApiParam({ name: 'routeId', description: 'Route ID', example: 'e5a53ba6-deda-11ef-9da2-54ee75718d0f' })
      @ApiResponse({
        status: 200,
        description: 'Device-Route deleted successfully',
        schema: {
          example: {
            success: true,
            message: 'All Device-Route deleted successfully',
            affected: 5,
          },
        },
      })
      @ApiResponse({
        status: 404,
        description: 'Route not found',
        type: DeviceRouteErrorResponse,
      })
      async removeByRouteId(@Param('routeId') routeId: string) {
        try {
          const result = await this.deviceRouteService.removeAllByRouteId(routeId);
          
          if (result.affected === 0) {
            return {
              success: true,
              message: 'device-routes of route is empty. No device-routes points were deleted.',
              affected: 0,
            };
          }
          
          return {
            success: true,
            message: 'All device-routes deleted successfully',
            affected: result.affected,
          };
        } catch (error) {
          if (error instanceof NotFoundException) {
            throw error;
          }
          throw error;
        }
      }

      @Delete('device/:deviceId')
      @ApiOperation({ summary: 'Delete all device-routes for a specific device' })
      @ApiParam({ name: 'deviceId', description: 'Device ID', example: 'e5a53ba6-deda-11ef-9da2-54ee75718d0f' })
      @ApiResponse({
        status: 200,
        description: 'Device-Routes deleted successfully',
        schema: {
          example: {
            success: true,
            message: 'All device-routes deleted successfully',
            affected: 5,
          },
        },
      })
      @ApiResponse({
        status: 404,
        description: 'Device not found',
        type: DeviceRouteErrorResponse,
      })
      async removeByDeviceId(@Param('deviceId') deviceId: string) {
        try {
          const result = await this.deviceRouteService.removeAllByDeviceId(deviceId);
          
          if (result.affected === 0) {
            return {
              success: true,
              message: 'device-routes of route is empty. No device-routes points were deleted.',
              affected: 0,
            };
          }
          
          return {
            success: true,
            message: 'All device-routes deleted successfully',
            affected: result.affected,
          };
        } catch (error) {
          if (error instanceof NotFoundException) {
            throw error;
          }
          throw error;
        }
      }
}