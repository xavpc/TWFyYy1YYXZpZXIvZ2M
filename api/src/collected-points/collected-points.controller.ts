import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { CollectedPointsService } from './collected-points.service';
import { CreateCollectedPointsDto } from './dto/create-collected-points.dto';
import { UpdateCollectedPointsDto } from './dto/update-collected-points.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CollectedPointResponse, CollectedPointListResponse, ErrorResponse } from './dto/response.dto';

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
    type: ErrorResponse,
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
    type: ErrorResponse,
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

  @Get('collection-point/:collectionPointId')
  @ApiOperation({
    summary: 'Check if a collection point has been collected(temporary)',
    description: 
      'Retrieves all collected points for a specific collection point. If any collected points are returned in the response, ' +
      'it means the collection point has been collected. If the response is empty, the collection point has not been collected yet.\n\n' +
      '**Usage Scenario:**\n' +
      '- This endpoint acts as a verification tool to check whether a collection point has been collected by a device.\n\n' +
      '**Example Request:**\n' +
      '`GET /collected-points/collection-point/123e4567-e89b-12d3-a456-426614174000`\n\n' +
      '**Example Response (Collection Point Collected):**\n' +
      '```json\n' +
      '{\n' +
      '  "success": true,\n' +
      '  "message": "Collected points retrieved successfully",\n' +
      '  "data": [\n' +
      '    {\n' +
      '      "collected_point_id": "abc123",\n' +
      '      "device_id": "device789",\n' +
      '      "collection_point_id": "123e4567-e89b-12d3-a456-426614174000",\n' +
      '      "push_timestamp": "2024-02-10T12:00:00Z",\n' +
      '      "collected_timestamp": "2024-02-10T11:55:00Z"\n' +
      '    }\n' +
      '  ],\n' +
      '  "total": 1\n' +
      '}\n' +
      '```\n\n' +
      '**Example Response (Collection Point Not Collected):**\n' +
      '```json\n' +
      '{\n' +
      '  "success": true,\n' +
      '  "message": "No collected points found for the given collection point",\n' +
      '  "data": [],\n' +
      '  "total": 0\n' +
      '}\n' +
      '```'
  })
  @ApiParam({ name: 'collectionPointId', description: 'Collection Point ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Collected points retrieved successfully',
    type: CollectedPointListResponse,
  })
  async findByCollectionPoint(@Param('collectionPointId') collectionPointId: string) {
    const collectedPoints = await this.collectedPointsService.findByCollectionPoint(collectionPointId);
    return {
      success: true,
      message: 'Collected points retrieved successfully for the collection point',
      data: collectedPoints,
      total: collectedPoints.length,
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
    type: ErrorResponse,
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
    type: ErrorResponse,
  })
  async remove(@Param('id') id: string) {
    await this.collectedPointsService.remove(id);
    return {
      success: true,
      message: 'Collected points deleted successfully',
    };
  }
}