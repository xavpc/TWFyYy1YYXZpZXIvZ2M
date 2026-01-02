import { Controller, Get, Post, Body, Param, Put, Delete, Query, HttpStatus, HttpCode, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { DeviceSessionService } from './device-session.service';
import { DeviceSession } from './device-session.entity';
import { CreateDeviceSessionDto } from './dto/device-session-create.dto';
import { UpdateDeviceSessionDto } from './dto/device-session-update.dto';
import { DeviceSessionResponse, DeviceSessionListResponse, DeviceSessionErrorResponse } from './dto/response.dto';

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
  @ApiOperation({ summary: 'Get all device sessions' })
  @ApiResponse({ status: 200, description: 'List of all sessions', type: DeviceSessionListResponse })
  async findAll(): Promise<DeviceSessionListResponse> {
    const sessions = await this.deviceSessionService.findAll();
    return {
      success: true,
      message: 'Device sessions retrieved successfully',
      data: sessions,
      total: sessions.length
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
  @ApiResponse({ status: 200, description: 'List of sessions for the device', type: DeviceSessionListResponse })
  async findByDeviceId(@Param('device_id') device_id: string): Promise<DeviceSessionListResponse> {
    const sessions = await this.deviceSessionService.findByDeviceId(device_id);
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

  @Get('date-range')
  @ApiOperation({ summary: 'Find sessions within a date range' })
  @ApiQuery({ name: 'startDate', description: 'Start date for range search (ISO format)' })
  @ApiQuery({ name: 'endDate', description: 'End date for range search (ISO format)' })
  @ApiResponse({ status: 200, description: 'List of sessions in date range', type: DeviceSessionListResponse })
  async findSessionsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<DeviceSessionListResponse> {
    const sessions = await this.deviceSessionService.findSessionsByDateRange(
      new Date(startDate),
      new Date(endDate),
    );
    return {
      success: true,
      message: 'Device sessions within date range retrieved successfully',
      data: sessions,
      total: sessions.length
    };
  }
}