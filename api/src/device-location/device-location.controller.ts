import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { DeviceLocationService } from './device-location.service';
import { CreateDeviceLocationDto } from './dto/create-deviceLocation.dto';
import { UpdateDeviceLocationDto } from './dto/update-deviceLocation.dto';
import { DeviceLocationResponse, DeviceLocationListResponse, DeviceLocationErrorResponse } from './dto/response.dto';

@ApiTags('Device Locations')
@Controller('device-locations')
export class DeviceLocationController {
  constructor(private readonly deviceLocationService: DeviceLocationService) {}

  @Post('')
  @ApiTags('FOR MOBILE USE')
  @ApiOperation({ summary: 'Create a new device location' })
  @ApiBody({ type: CreateDeviceLocationDto, description: 'Device location data to create' })
  @ApiResponse({
    status: 201,
    description: 'Device location created successfully',
    type: DeviceLocationResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
    type: DeviceLocationErrorResponse,
  })
  async create(@Body() createDeviceLocationDto: CreateDeviceLocationDto) {
    const newDeviceLocation = await this.deviceLocationService.create(createDeviceLocationDto);
    return {
      success: true,
      message: 'Device location created successfully',
      data: newDeviceLocation,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all device locations' })
  @ApiResponse({
    status: 200,
    description: 'Device locations retrieved successfully',
    type: DeviceLocationListResponse,
  })
  async findAll() {
    const deviceLocations = await this.deviceLocationService.findAll();
    return {
      success: true,
      message: 'Device locations retrieved successfully',
      data: deviceLocations,
      total: deviceLocations.length,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a device location by ID' })
  @ApiParam({ name: 'id', description: 'Device location ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Device location retrieved successfully',
    type: DeviceLocationResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Device location not found',
    type: DeviceLocationErrorResponse,
  })
  async findOne(@Param('id') id: string) {
    const deviceLocation = await this.deviceLocationService.findOne(id);
    if (!deviceLocation) {
      throw new NotFoundException(`Device Location with ID ${id} not found`);
    }
    return {
      success: true,
      message: 'Device location retrieved successfully',
      data: deviceLocation,
    };
  }

  @Get('device/:deviceId')
  @ApiOperation({ summary: 'Get all device locations for a specific device' })
  @ApiParam({ name: 'deviceId', description: 'Device ID' })
  @ApiResponse({
    status: 200,
    description: 'Device locations retrieved successfully',
    type: DeviceLocationListResponse,
  })
  async findByDevice(@Param('deviceId') deviceId: string) {
    const deviceLocations = await this.deviceLocationService.findByDevice(deviceId);
    return {
      success: true,
      message: 'Device locations retrieved successfully for the device',
      data: deviceLocations,
      total: deviceLocations.length,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a device location' })
  @ApiParam({ name: 'id', description: 'Device location ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ type: CreateDeviceLocationDto, description: 'Device location data to update' })
  @ApiResponse({
    status: 200,
    description: 'Device location updated successfully',
    type: DeviceLocationResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Device location not found',
    type: DeviceLocationErrorResponse,
  })
  async update(@Param('id') id: string, @Body() updateDeviceLocationDto: UpdateDeviceLocationDto) {
    const updatedDeviceLocation = await this.deviceLocationService.update(id, updateDeviceLocationDto);
    return {
      success: true,
      message: 'Device location updated successfully',
      data: updatedDeviceLocation,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a device location' })
  @ApiParam({ name: 'id', description: 'Device location ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Device location deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Device location deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Device location not found',
    type: DeviceLocationErrorResponse,
  })
  async remove(@Param('id') id: string) {
    await this.deviceLocationService.remove(id);
    return {
      success: true,
      message: 'Device location deleted successfully',
    };
  }
}
