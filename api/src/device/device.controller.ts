import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { DeviceResponse, DeviceListResponse, DeviceErrorResponse } from './dto/response.dto';  // Ensure these DTOs are created as per your pattern

@ApiTags('Devices')
@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post('')
  @ApiOperation({ summary: 'Create a new device' })
  @ApiBody({ type: CreateDeviceDto, description: 'Device data to create' })
  @ApiResponse({
    status: 201,
    description: 'Device created successfully',
    type: DeviceResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
    type: DeviceErrorResponse,
  })
  async create(@Body() createDeviceDto: CreateDeviceDto) {
    const newDevice = await this.deviceService.create(createDeviceDto);
    return {
      success: true,
      message: 'Device created successfully',
      data: newDevice,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all devices' })
  @ApiResponse({
    status: 200,
    description: 'Devices retrieved successfully',
    type: DeviceListResponse,
  })
  async findAll() {
    const devices = await this.deviceService.findAll();
    return {
      success: true,
      message: 'Devices retrieved successfully',
      data: devices,
      total: devices.length,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a device by ID' })
  @ApiParam({ name: 'id', description: 'Device ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Device retrieved successfully',
    type: DeviceResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Device not found',
    type: DeviceErrorResponse,
  })
  async findOne(@Param('id') id: string) {
    const device = await this.deviceService.findOne(id);
    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }
    return {
      success: true,
      message: 'Device retrieved successfully',
      data: device,
    };
  }

    @Get('employee/:employeeId')
    @ApiOperation({ summary: 'Get all device for a specific employee' })
    @ApiParam({ name: 'employeeId', description: 'Employee ID' })
    @ApiResponse({
      status: 200,
      description: 'Devices retrieved successfully',
      type: DeviceListResponse,
    })
    async findByEmployee(@Param('employeeId') employeeId: string) {
      const device = await this.deviceService.findByEmployee(employeeId);
      return {
        success: true,
        message: 'Devices retrieved successfully for the employee',
        data: device,
        total: device.length,
      };
    }


  @Put(':id')
  @ApiOperation({ summary: 'Update a device' })
  @ApiParam({ name: 'id', description: 'Device ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ type: CreateDeviceDto, description: 'Device data to update' })
  @ApiResponse({
    status: 200,
    description: 'Device updated successfully',
    type: DeviceResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
    type: DeviceErrorResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Device not found',
    type: DeviceErrorResponse,
  })
  async update(@Param('id') id: string, @Body() updateDeviceDto: UpdateDeviceDto) {
    const updatedDevice = await this.deviceService.update(id, updateDeviceDto);
    return {
      success: true,
      message: 'Device updated successfully',
      data: updatedDevice,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a device' })
  @ApiParam({ name: 'id', description: 'Device ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Device deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Device deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Device not found',
    type: DeviceErrorResponse,
  })
  async remove(@Param('id') id: string) {
    await this.deviceService.remove(id);
    return {
      success: true,
      message: 'Device deleted successfully',
    };
  }
}
