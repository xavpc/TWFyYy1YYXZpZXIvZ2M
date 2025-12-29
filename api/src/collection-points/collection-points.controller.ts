import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { CollectionPointsService } from './collection-points.service';
import { CreateCollectionPointsDto } from './dto/create-collection-points.dto';
import { UpdateCollectionPointsDto } from './dto/update-collection-points.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CollectionPointResponse, CollectionPointListResponse, CollectionPointsErrorResponse } from './dto/response.dto';

@ApiTags('Collection Points')
@Controller('collection-points')
export class CollectionPointsController {
  constructor(private readonly collectionPointsService: CollectionPointsService) {}

  @Post('')
  @ApiOperation({ summary: 'Create a new collection point' })
  @ApiBody({ type: CreateCollectionPointsDto, description: 'Collection point data to create' })
  @ApiResponse({
    status: 201,
    description: 'Collection point created successfully',
    type: CollectionPointResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
    type: CollectionPointsErrorResponse,
  })
  async create(@Body() CreateCollectionPointsDto: CreateCollectionPointsDto) {
    const newCollectionPoint = await this.collectionPointsService.create(CreateCollectionPointsDto);
    return {
      success: true,
      message: 'Collection point created successfully',
      data: newCollectionPoint,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all collection points' })
  @ApiResponse({
    status: 200,
    description: 'Collection points retrieved successfully',
    type: CollectionPointListResponse,
  })
  async findAll() {
    const collectionPoints = await this.collectionPointsService.findAll();
    return {
      success: true,
      message: 'Collection points retrieved successfully',
      data: collectionPoints,
      total: collectionPoints.length,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a collection point by ID' })
  @ApiParam({ name: 'id', description: 'Collection point ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Collection point retrieved successfully',
    type: CollectionPointResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Collection point not found',
    type: CollectionPointsErrorResponse,
  })
  async findOne(@Param('id') id: string) {
    const collectionPoint = await this.collectionPointsService.findOne(id);
    return {
      success: true,
      message: 'Collection point retrieved successfully',
      data: collectionPoint,
    };
  }

  @Get('route/:routeId')
  @ApiTags('FOR MOBILE USE')
  @ApiOperation({ summary: 'Get all collection points for a specific route' })
  @ApiParam({ name: 'routeId', description: 'Route ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Collection points retrieved successfully',
    type: CollectionPointListResponse,
  })
  async findByRoute(@Param('routeId') routeId: string) {
    const collectionPoints = await this.collectionPointsService.findByRoute(routeId);
    return {
      success: true,
      message: 'Collection points retrieved successfully for the route',
      data: collectionPoints,
      total: collectionPoints.length,
    };
  }

  @Get('name/:name')
  @ApiOperation({ summary: 'Get a collection point by name' })
  @ApiParam({ name: 'name', description: 'Collection point name', example: 'Downtown Collection Point' })
  @ApiResponse({
    status: 200,
    description: 'Collection point retrieved successfully',
    type: CollectionPointResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Collection point not found',
    type: CollectionPointsErrorResponse,
  })
  async findByName(@Param('name') name: string) {
    const collectionPoint = await this.collectionPointsService.findByName(name);
    return {
      success: true,
      message: 'Collection point retrieved successfully',
      data: collectionPoint,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a collection point' })
  @ApiParam({ name: 'id', description: 'Collection point ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ type: CreateCollectionPointsDto, description: 'Collection point data to update' })
  @ApiResponse({
    status: 200,
    description: 'Collection point updated successfully',
    type: CollectionPointResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Collection point not found',
    type: CollectionPointsErrorResponse,
  })
  async update(@Param('id') id: string, @Body() UpdateCollectionPointsDto: UpdateCollectionPointsDto) {
    const updatedCollectionPoint = await this.collectionPointsService.update(id, UpdateCollectionPointsDto);
    return {
      success: true,
      message: 'Collection point updated successfully',
      data: updatedCollectionPoint,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a collection point' })
  @ApiParam({ name: 'id', description: 'Collection point ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Collection point deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Collection point deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Collection point not found',
    type: CollectionPointsErrorResponse,
  })
  async remove(@Param('id') id: string) {
    await this.collectionPointsService.remove(id);
    return {
      success: true,
      message: 'Collection point deleted successfully',
    };
  }


    @Delete('route/:routeId')
    @ApiOperation({ summary: 'Delete all collection points for a specific route' })
    @ApiParam({ name: 'routeId', description: 'Route ID', example: 'e5a53ba6-deda-11ef-9da2-54ee75718d0f' })
    @ApiResponse({
      status: 200,
      description: 'Collection points deleted successfully',
      schema: {
        example: {
          success: true,
          message: 'All collection points deleted successfully',
          affected: 5,
        },
      },
    })
    @ApiResponse({
      status: 404,
      description: 'Route not found',
      type: CollectionPointsErrorResponse,
    })
    async removeByRouteId(@Param('routeId') routeId: string) {
      try {
        const result = await this.collectionPointsService.removeAllByRouteId(routeId);
        
        if (result.affected === 0) {
          return {
            success: true,
            message: 'collection points of route is empty. No collection points were deleted.',
            affected: 0,
          };
        }
        
        return {
          success: true,
          message: 'All collection points deleted successfully',
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