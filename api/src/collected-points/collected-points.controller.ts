import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { CollectedPointsService } from './collected-points.service';
import { CreateCollectedPointsDto } from './dto/create-collected-points.dto';
import { UpdateCollectedPointsDto } from './dto/update-collected-points.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CollectedPointResponse, CollectedPointListResponse, CollectedPointsErrorResponse } from './dto/response.dto';

@ApiTags('Collected Points')
@Controller('collected-points')
export class CollectedPointsController {
  constructor(private readonly collectedPointsService: CollectedPointsService) {}

  @Post('')
  @ApiTags('FOR MOBILE USE')
  @ApiOperation({ summary: 'Create a new collected point' })
  @ApiBody({ type: CreateCollectedPointsDto, description: 'Collected point data to create' })
  @ApiResponse({
    status: 201,
    description: 'Collected point created successfully',
    type: CollectedPointResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
    type: CollectedPointsErrorResponse,
  })
  async create(@Body() createCollectedPointsDto: CreateCollectedPointsDto) {
    const newCollectedPoints = await this.collectedPointsService.create(createCollectedPointsDto);
    return {
      success: true,
      message: 'Collected points created successfully',
      data: newCollectedPoints,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all collected points' })
  @ApiResponse({
    status: 200,
    description: 'Collected points retrieved successfully',
    type: CollectedPointListResponse,
  })
  async findAll() {
    const collectedPointss = await this.collectedPointsService.findAll();
    return {
      success: true,
      message: 'Collected points retrieved successfully',
      data: collectedPointss,
      total: collectedPointss.length,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a collected point by ID' })
  @ApiParam({ name: 'id', description: 'Collected point ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Collected point retrieved successfully',
    type: CollectedPointResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Collected point not found',
    type: CollectedPointsErrorResponse,
  })
  async findOne(@Param('id') id: string) {
    const collectedPoints = await this.collectedPointsService.findOne(id);
    if (!collectedPoints) {
      throw new NotFoundException(`Collected Point with ID ${id} not found`);
    }
    return {
      success: true,
      message: 'Collected points retrieved successfully',
      data: collectedPoints,
    };
  }

  @Get('device/:deviceId')
  @ApiTags('FOR MOBILE USE')
  @ApiOperation({ summary: 'Get all collected points for a specific device' })
  @ApiParam({ name: 'deviceId', description: 'Device ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Collected points retrieved successfully',
    type: CollectedPointListResponse,
  })
  async findByDevice(@Param('deviceId') deviceId: string) {
    const collectedPointss = await this.collectedPointsService.findByDevice(deviceId);
    return {
      success: true,
      message: 'Collected points retrieved successfully for the device',
      data: collectedPointss,
      total: collectedPointss.length,
    };
  }

  @Get('session/:sessionId')
  @ApiTags('FOR MOBILE USE')
  @ApiOperation({ summary: 'Get all collected points for a specific device session' })
  @ApiParam({ name: 'sessionId', description: 'Session ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Collected points retrieved successfully',
    type: CollectedPointListResponse,
  })
  async findBySession(@Param('sessionId') sessionId: string) {
    const collectedPointss = await this.collectedPointsService.findBySession(sessionId);
    return {
      success: true,
      message: 'Collected points retrieved successfully for the session',
      data: collectedPointss,
      total: collectedPointss.length,
    };
  }

  @Get('collection-point/:collectionPointId/:sessionId')
  @ApiTags('FOR MOBILE USE')
  @ApiOperation({
    summary: 'Check if a collection point has been collected',
    description: 
      'Verifies if a collection point has been collected during a given session. ' +
      'If `isCollected` is `true`, the collection point has been collected; if `false`, it has not been collected.\n\n' +
      '**Usage Scenario:**\n' +
      '- This endpoint is used to confirm whether a specific collection point has already been processed within a particular session.\n\n' +
      '**Example Request:**\n' +
      '`GET /collected-points/collection-point/123e4567-e89b-12d3-a456-426614174000/0a458882-4db0-4f67-a916-6753975e1da4`\n\n' +
      '**Example Response (Collected):**\n' +
      '```json\n' +
      '{\n' +
      '  "success": true,\n' +
      '  "message": "Collection point has been collected.",\n' +
      '  "isCollected": true\n' +
      '}\n' +
      '```\n\n' +
      '**Example Response (Not Collected):**\n' +
      '```json\n' +
      '{\n' +
      '  "success": true,\n' +
      '  "message": "Collection point has not been collected.",\n' +
      '  "isCollected": false\n' +
      '}\n' +
      '```'
  })
  @ApiParam({ name: 'collectionPointId', description: 'Collection Point ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiParam({ name: 'sessionId', description: 'Session ID', example: '0a458882-4db0-4f67-a916-6753975e1da4' })
  @ApiResponse({
    status: 200,
    description: 'Collection status retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Collection point has been collected.',
        isCollected: true
      }
    }
  })
  async checkCollectionStatus(
    @Param('collectionPointId') collectionPointId: string,
    @Param('sessionId') sessionId: string
  ) {
    const isCollected = await this.collectedPointsService.isCollectionAlreadyCollected(
      collectionPointId,
      sessionId
    );
  
    return {
      success: true,
      message: isCollected 
        ? 'Collection point has been collected.'
        : 'Collection point has not been collected.',
      isCollected
    };
  }
  

  @Put(':id')
  @ApiOperation({ summary: 'Update a collected point' })
  @ApiParam({ name: 'id', description: 'Collected point ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ type: CreateCollectedPointsDto, description: 'Collected point data to update' })
  @ApiResponse({
    status: 200,
    description: 'Collected point updated successfully',
    type: CollectedPointResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Collected point not found',
    type: CollectedPointsErrorResponse,
  })
  async update(@Param('id') id: string, @Body() updateCollectedPointsDto: UpdateCollectedPointsDto) {
    const updatedCollectedPoints = await this.collectedPointsService.update(id, updateCollectedPointsDto);
    return {
      success: true,
      message: 'Collected points updated successfully',
      data: updatedCollectedPoints,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a collected point' })
  @ApiParam({ name: 'id', description: 'Collected point ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Collected point deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Collected point deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Collected point not found',
    type: CollectedPointsErrorResponse,
  })
  async remove(@Param('id') id: string) {
    await this.collectedPointsService.remove(id);
    return {
      success: true,
      message: 'Collected points deleted successfully',
    };
  }
}