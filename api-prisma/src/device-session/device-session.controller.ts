  import { Controller, Get, Post, Body, Param, Put, Delete, Query, HttpStatus, HttpCode, NotFoundException } from '@nestjs/common';
  import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
  import { DeviceSessionService } from './device-session.service';
  import { DeviceSession } from './device-session.entity';
  import { CreateDeviceSessionDto } from './dto/device-session-create.dto';
  import { UpdateDeviceSessionDto } from './dto/device-session-update.dto';
  import { DeviceSessionResponse, DeviceSessionListResponse, DeviceSessionErrorResponse, DeviceSessionsArrayResponse } from './dto/response.dto';
import { FilterDeviceSessionDto } from './dto/device-session-filter.dto';

  @ApiTags('device-sessions')
  @Controller('device-sessions')
  export class DeviceSessionController {
    constructor(private readonly deviceSessionService: DeviceSessionService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new device session' })
    @ApiBody({ type: CreateDeviceSessionDto, description: 'Device session creation data' })
    @ApiResponse({ status: 201, description: 'Session created successfully', type: DeviceSessionResponse })
    @ApiResponse({ status: 400, description: 'Bad request', type: DeviceSessionErrorResponse })
    async create(@Body() createDeviceSessionDto: CreateDeviceSessionDto): Promise<DeviceSessionResponse> {
      const session = await this.deviceSessionService.create(createDeviceSessionDto);
      return {
        success: true,
        message: 'Device session created successfully',
        data: session
      };
    }

  @Get()
  @ApiOperation({ summary: 'Get all device sessions with comprehensive filtering' })
  @ApiQuery({ name: 'session_id', description: 'Filter by session ID', required: false })
  @ApiQuery({ name: 'device_route_id', description: 'Filter by device route ID', required: false })
  @ApiQuery({ name: 'device_id', description: 'Filter by device ID', required: false })
  @ApiQuery({ name: 'route_id', description: 'Filter by route ID', required: false })
  @ApiQuery({ name: 'employee_id', description: 'Filter by employee ID', required: false })
  @ApiQuery({ name: 'start_date', description: 'Filter sessions starting from this date (ISO format)', required: false })
  @ApiQuery({ name: 'end_date', description: 'Filter sessions ending before this date (ISO format)', required: false })
  @ApiQuery({ name: 'date', description: 'Filter sessions for a specific date (ISO format)', required: false })
  @ApiQuery({ name: 'is_active', description: 'Filter by active status (true/false)', required: false, type: Boolean })
  @ApiQuery({ name: 'has_report', description: 'Filter by report existence (true/false)', required: false, type: Boolean })
  @ApiQuery({ name: 'started_after', description: 'Sessions started after this datetime (ISO format)', required: false })
  @ApiQuery({ name: 'started_before', description: 'Sessions started before this datetime (ISO format)', required: false })
  @ApiQuery({ name: 'ended_after', description: 'Sessions ended after this datetime (ISO format)', required: false })
  @ApiQuery({ name: 'ended_before', description: 'Sessions ended before this datetime (ISO format)', required: false })
  @ApiQuery({ name: 'device_name', description: 'Filter by device name', required: false })
  @ApiQuery({ name: 'vehicle_plate_num', description: 'Filter by vehicle plate number', required: false })
  @ApiQuery({ name: 'employee_name', description: 'Filter by employee name', required: false })
  @ApiQuery({ name: 'employee_email', description: 'Filter by employee email', required: false })
  @ApiQuery({ name: 'route_name', description: 'Filter by route name', required: false })
  @ApiQuery({ name: 'search', description: 'Global search across multiple fields', required: false })
  @ApiQuery({ name: 'page', description: 'Page number for pagination', required: false, type: Number })
  @ApiQuery({ name: 'limit', description: 'Number of items per page', required: false, type: Number })
  @ApiQuery({ name: 'sort_by', description: 'Field to sort by', required: false })
  @ApiQuery({ name: 'sort_order', description: 'Sort order (ASC/DESC)', required: false, enum: ['ASC', 'DESC'] })
  @ApiResponse({ status: 200, description: 'List of sessions with pagination info', type: DeviceSessionListResponse })
  async findAll(@Query() filterDto: FilterDeviceSessionDto): Promise<DeviceSessionListResponse> {
    // Convert string dates to Date objects
    if (filterDto.start_date) filterDto.start_date = new Date(filterDto.start_date);
    if (filterDto.end_date) filterDto.end_date = new Date(filterDto.end_date);
    if (filterDto.date) filterDto.date = new Date(filterDto.date);
    if (filterDto.started_after) filterDto.started_after = new Date(filterDto.started_after);
    if (filterDto.started_before) filterDto.started_before = new Date(filterDto.started_before);
    if (filterDto.ended_after) filterDto.ended_after = new Date(filterDto.ended_after);
    if (filterDto.ended_before) filterDto.ended_before = new Date(filterDto.ended_before);

    const result = await this.deviceSessionService.findAll(filterDto);
    return {
      success: true,
      message: 'Device sessions retrieved successfully',
      data: result.data,
      total: result.total,
      page: filterDto.page || 1,
      limit: filterDto.limit || 10,
      totalPages: Math.ceil(result.total / (filterDto.limit || 10))
    };
  }

    @Get('active')
    @ApiOperation({ summary: 'Get all active device sessions' })
    @ApiResponse({ status: 200, description: 'List of active sessions', type: DeviceSessionListResponse })
    async findActiveSessions(): Promise<DeviceSessionListResponse> {
      const sessions = await this.deviceSessionService.findActiveSessions();
      return {
        success: true,
        message: 'Active device sessions retrieved successfully',
        data: sessions,
        total: sessions.length
      };
    }

    @Get('device/:device_id')
    @ApiOperation({ summary: 'Find all sessions for a specific device' })
    @ApiParam({ name: 'device_id', description: 'Device ID to find sessions for' })
    @ApiQuery({ name: 'getActive', description: 'Filter by active sessions only', required: false, type: Boolean })
    @ApiResponse({ status: 200, description: 'List of sessions for the device', type: DeviceSessionListResponse })
    async findByDeviceId(
      @Param('device_id') device_id: string,
      @Query('getActive') getActive?: string
    ): Promise<DeviceSessionListResponse> {
      const isActive = getActive === 'true';
      const sessions = await this.deviceSessionService.findByDeviceId(device_id, isActive);
      return {
        success: true,
        message: `Device sessions for device ${device_id} retrieved successfully`,
        data: sessions,
        total: sessions.length
      };
    }

    @Get('device/:device_id/active')
    @ApiOperation({ summary: 'Find the active session for a specific device' })
    @ApiParam({ name: 'device_id', description: 'Device ID to find active session for' })
    @ApiResponse({ status: 200, description: 'Active session for the device', type: DeviceSessionResponse })
    @ApiResponse({ status: 404, description: 'No active session found for the device', type: DeviceSessionErrorResponse })
    async findActiveSessionByDeviceId(@Param('device_id') device_id: string): Promise<DeviceSessionResponse> {
      try {
        const session = await this.deviceSessionService.findActiveSessionByDeviceId(device_id);
        if (!session) {
          throw new NotFoundException(`No active session found for device with ID ${device_id}`);
        }
        return {
          success: true,
          message: `Active session for device ${device_id} retrieved successfully`,
          data: session
        };
      } catch (error) {
        throw error;
      }
    }

    @Get('filter/by-device-route-and-date')
    @ApiOperation({ summary: 'Find sessions by device route ID, date, and optionally by device ID' })
    @ApiQuery({ name: 'deviceRouteId', description: 'Route ID', required: true })
    @ApiQuery({ name: 'date', description: 'Date to search for sessions (ISO format)', required: true })
    @ApiQuery({ name: 'deviceId', description: 'Optional device ID to filter by', required: false })
    @ApiQuery({ name: 'getActive', description: 'Filter by active sessions only', required: false, type: Boolean })
    @ApiResponse({ status: 200, description: 'List of sessions matching filters', type: DeviceSessionListResponse })
    async findSessionsByRouteAndDate(
      @Query('deviceRouteId') deviceRouteId: string,
      @Query('date') dateString: string,
      @Query('deviceId') deviceId?: string,
      @Query('getActive') getActive?: string
    ): Promise<DeviceSessionListResponse> {
      const date = new Date(dateString);
      const isActive = getActive === 'true';
      const sessions = await this.deviceSessionService.findSessionsByRouteAndDate(
        deviceRouteId, 
        date, 
        deviceId, 
        isActive
      );
      
      return {
        success: true,
        message: 'Device sessions for specified filters retrieved successfully',
        data: sessions,
        total: sessions.length
      };
    }

    @Get('filter/by-date')
    @ApiOperation({ summary: 'Find sessions for a specific date and optionally by device ID' })
    @ApiQuery({ name: 'date', description: 'Date to search for sessions (ISO format)' })
    @ApiQuery({ name: 'deviceId', description: 'Optional device ID to filter by', required: false })
    @ApiQuery({ name: 'getActive', description: 'Filter by active sessions only', required: false, type: Boolean })
    @ApiResponse({ status: 200, description: 'List of sessions for the specified filters', type: DeviceSessionListResponse })
    async findSessionsByDate(
      @Query('date') dateString: string,
      @Query('deviceId') deviceId?: string,
      @Query('getActive') getActive?: string
    ): Promise<DeviceSessionListResponse> {
      const date = new Date(dateString);
      const isActive = getActive === 'true';
      const sessions = await this.deviceSessionService.findSessionsByDate(
        date, 
        deviceId, 
        isActive
      );
      
      return {
        success: true,
        message: 'Device sessions for specified filters retrieved successfully',
        data: sessions,
        total: sessions.length
      };
    }



    @Get(':session_id')
    @ApiOperation({ summary: 'Find a device session by ID' })
    @ApiParam({ name: 'session_id', description: 'Session ID to find' })
    @ApiResponse({ status: 200, description: 'Session found', type: DeviceSessionResponse })
    @ApiResponse({ status: 404, description: 'Session not found', type: DeviceSessionErrorResponse })
    async findOne(@Param('session_id') session_id: string): Promise<DeviceSessionResponse> {
      try {
        const session = await this.deviceSessionService.findOne(session_id);
        return {
          success: true,
          message: 'Device session retrieved successfully',
          data: session
        };
      } catch (error) {
        throw error;
      }
    }


    @Get('device-route/:deviceRouteId')
    @ApiOperation({ summary: 'Get all device sessions for a specific device route and optionally by device ID' })
    @ApiParam({ name: 'deviceRouteId', description: 'Route ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @ApiQuery({ name: 'deviceId', description: 'Optional device ID to filter by', required: false })
    @ApiQuery({ name: 'getActive', description: 'Filter by active sessions only', required: false, type: Boolean })
    @ApiResponse({
      status: 200,
      description: 'Device sessions retrieved successfully',
      type: DeviceSessionListResponse,
    })
    async findByRoute(
      @Param('deviceRouteId') deviceRouteId: string,
      @Query('deviceId') deviceId?: string,
      @Query('getActive') getActive?: string
    ) {
      const isActive = getActive === 'true';
      const sessions = await this.deviceSessionService.findByDeviceRoute(
        deviceRouteId, 
        deviceId, 
        isActive
      );
      return {
        success: true,
        message: 'Sessions retrieved successfully for the filters',
        data: sessions,
        total: sessions.length,
      };
    }



    @Put(':session_id')
    @ApiOperation({ summary: 'Update a device session' })
    @ApiParam({ name: 'session_id', description: 'Session ID to update' })
    @ApiBody({ type: UpdateDeviceSessionDto, description: 'Device session update data' })
    @ApiResponse({ status: 200, description: 'Session updated successfully', type: DeviceSessionResponse })
    @ApiResponse({ status: 404, description: 'Session not found', type: DeviceSessionErrorResponse })
    async update(
      @Param('session_id') session_id: string,
      @Body() updateDeviceSessionDto: UpdateDeviceSessionDto,
    ): Promise<DeviceSessionResponse> {
      try {
        const session = await this.deviceSessionService.update(session_id, updateDeviceSessionDto);
        return {
          success: true,
          message: 'Device session updated successfully',
          data: session
        };
      } catch (error) {
        throw error;
      }
    }

    @Put(':session_id/end')
    @ApiOperation({ summary: 'End a device session' })
    @ApiParam({ name: 'session_id', description: 'Session ID to end' })
    @ApiResponse({ status: 200, description: 'Session ended successfully', type: DeviceSessionResponse })
    @ApiResponse({ status: 404, description: 'Session not found or already ended', type: DeviceSessionErrorResponse })
    async endSession(@Param('session_id') session_id: string): Promise<DeviceSessionResponse> {
      try {
        const session = await this.deviceSessionService.endSession(session_id);
        return {
          success: true,
          message: 'Device session ended successfully',
          data: session
        };
      } catch (error) {
        throw error;
      }
    }

    @Put('device/:device_id/end-active')
    @ApiOperation({ summary: 'End the active session for a specific device' })
    @ApiParam({ name: 'device_id', description: 'Device ID to end active session for' })
    @ApiResponse({ status: 200, description: 'Session ended successfully', type: DeviceSessionResponse })
    @ApiResponse({ status: 404, description: 'No active session found', type: DeviceSessionErrorResponse })
    async endActiveSessionByDeviceId(@Param('device_id') device_id: string): Promise<DeviceSessionResponse> {
      try {
        const endedSession = await this.deviceSessionService.endActiveSessionByDeviceId(device_id);
        if (!endedSession) {
          throw new NotFoundException(`No active session found for device with ID ${device_id}`);
        }
        return {
          success: true,
          message: `Active session for device ${device_id} ended successfully`,
          data: endedSession
        };
      } catch (error) {
        throw error;
      }
    }

    @Delete(':session_id')
    @ApiOperation({ summary: 'Remove a device session' })
    @ApiParam({ name: 'session_id', description: 'Session ID to remove' })
    @ApiResponse({ status: 200, description: 'Session removed successfully', type: DeviceSessionResponse })
    @ApiResponse({ status: 404, description: 'Session not found', type: DeviceSessionErrorResponse })
    async remove(@Param('session_id') session_id: string): Promise<DeviceSessionResponse> {
      try {
        const session = await this.deviceSessionService.remove(session_id);
        return {
          success: true,
          message: 'Device session removed successfully',
          data: session
        };
      } catch (error) {
        throw error;
      }
    }


    //dont use this TwT
    @Delete()
    @ApiResponse({ status: 200, description: 'All sessions removed successfully', type: DeviceSessionsArrayResponse })
    async removeAll(): Promise<DeviceSessionsArrayResponse> {
      try {
        const sessions = await this.deviceSessionService.removeAll();
        return {
          success: true,
          message: 'All device sessions removed successfully',
          data: sessions
        };
      } catch (error) {
        throw error;
      }
    }
    

  }