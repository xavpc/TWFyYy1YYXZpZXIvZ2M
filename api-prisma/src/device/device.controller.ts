import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query,
  NotFoundException 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiBody,
  ApiQuery 
} from '@nestjs/swagger';
import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { FilterDeviceDto } from './dto/filter-device.dto';
import { DeviceResponse, DeviceListResponse, DeviceErrorResponse } from './dto/response.dto';

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
  @ApiResponse({
    status: 404,
    description: 'Employee not found',
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
  @ApiOperation({ 
    summary: 'Get all devices with filtering, pagination, and search',
    description: `
    Retrieve devices with comprehensive filtering options:
    - Filter by device name, vehicle plate number, status, or employee
    - Global search across all device and employee fields
    - Pagination with customizable page size
    - Sorting by any field in ascending or descending order
    `
  })
  @ApiQuery({ name: 'device_name', required: false, description: 'Filter by device name', example: 'Tablet' })
  @ApiQuery({ name: 'vehicle_plate_num', required: false, description: 'Filter by vehicle plate number', example: 'ABC-1234' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by device status', enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'] })
  @ApiQuery({ name: 'employee_id', required: false, description: 'Filter by employee ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiQuery({ name: 'search', required: false, description: 'Global search term', example: 'tablet' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1, type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (max 100)', example: 10, type: Number })
  @ApiQuery({ name: 'sort_by', required: false, description: 'Sort field', example: 'device_name' })
  @ApiQuery({ name: 'sort_order', required: false, description: 'Sort order', enum: ['ASC', 'DESC'] })
  @ApiResponse({
    status: 200,
    description: 'Devices retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Devices retrieved successfully' },
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Device' }
        },
        total: { type: 'number', example: 25 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 3 }
      }
    }
  })
  async findAll(@Query() filterDto: FilterDeviceDto) {
    const { data, total } = await this.deviceService.findAll(filterDto);
    const { page = 1, limit = 10 } = filterDto;
    const totalPages = Math.ceil(total / limit);
    
    return {
      success: true,
      message: 'Devices retrieved successfully',
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages,
    };
  }

  @Get('search/global')
  @ApiOperation({ 
    summary: 'Global search across all device and employee fields',
    description: 'Search devices by device name, plate number, device ID, employee name, email, or employee ID'
  })
  @ApiQuery({ 
    name: 'q', 
    required: true, 
    description: 'Search term', 
    example: 'tablet' 
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
    type: DeviceListResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'No devices found matching search term',
    type: DeviceErrorResponse,
  })
  async globalSearch(@Query('q') searchTerm: string) {
    const devices = await this.deviceService.globalSearch(searchTerm);
    return {
      success: true,
      message: `Found ${devices.length} devices matching '${searchTerm}'`,
      data: devices,
      total: devices.length,
    };
  }

  @Get('search/field/:field')
  @ApiOperation({ 
    summary: 'Search devices by specific field',
    description: 'Search devices by a specific field like device_name, vehicle_plate_num, etc.'
  })
  @ApiParam({ 
    name: 'field', 
    description: 'Field to search in', 
    enum: ['device_name', 'vehicle_plate_num', 'device_id', 'status'],
    example: 'device_name' 
  })
  @ApiQuery({ 
    name: 'value', 
    required: true, 
    description: 'Value to search for', 
    example: 'tablet' 
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
    type: DeviceListResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'No devices found or invalid field',
    type: DeviceErrorResponse,
  })
  async searchByField(
    @Param('field') field: string, 
    @Query('value') value: string
  ) {
    const devices = await this.deviceService.searchByField(field as any, value);
    return {
      success: true,
      message: `Search results for ${field}: ${value}`,
      data: devices,
      total: devices.length,
    };
  }

  @Post('search/advanced')
  @ApiOperation({ 
    summary: 'Advanced search with multiple criteria',
    description: 'Search devices using multiple field criteria simultaneously'
  })
  @ApiBody({
    description: 'Search criteria object',
    schema: {
      type: 'object',
      properties: {
        device_name: { type: 'string', example: 'tablet' },
        vehicle_plate_num: { type: 'string', example: 'ABC' },
        status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'], example: 'ACTIVE' }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Advanced search results retrieved successfully',
    type: DeviceListResponse,
  })
  async advancedSearch(@Body() criteria: any) {
    const devices = await this.deviceService.advancedSearch(criteria);
    return {
      success: true,
      message: 'Advanced search completed',
      data: devices,
      total: devices.length,
    };
  }

  @Post('search/employee')
  @ApiOperation({ 
    summary: 'Search devices by employee information',
    description: 'Find devices assigned to employees based on employee name, email, or ID'
  })
  @ApiBody({
    description: 'Employee search criteria',
    schema: {
      type: 'object',
      properties: {
        employee_name: { type: 'string', example: 'John', description: 'Search in first/last name' },
        employee_email: { type: 'string', example: 'john@example.com' },
        employee_id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Devices found for employee criteria',
    type: DeviceListResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'No devices found matching employee criteria',
    type: DeviceErrorResponse,
  })
  async searchByEmployeeInfo(@Body() criteria: {
    employee_name?: string;
    employee_email?: string;
    employee_id?: string;
  }) {
    const devices = await this.deviceService.searchByEmployeeInfo(criteria);
    return {
      success: true,
      message: 'Devices found for employee criteria',
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
    return {
      success: true,
      message: 'Device retrieved successfully',
      data: device,
    };
  }

  @Get('employee/:employeeId')
  @ApiOperation({ 
    summary: 'Get all devices for a specific employee',
    description: 'Retrieve all devices assigned to a particular employee'
  })
  @ApiParam({ name: 'employeeId', description: 'Employee ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Devices retrieved successfully for the employee',
    type: DeviceListResponse,
  })
  async findByEmployee(@Param('employeeId') employeeId: string) {
    const devices = await this.deviceService.findByEmployee(employeeId);
    return {
      success: true,
      message: 'Devices retrieved successfully for the employee',
      data: devices,
      total: devices.length,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a device' })
  @ApiParam({ name: 'id', description: 'Device ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ type: UpdateDeviceDto, description: 'Device data to update' })
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
    description: 'Device or Employee not found',
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
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Device deleted successfully' }
      }
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