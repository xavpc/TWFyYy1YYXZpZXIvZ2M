import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { RouteCoordinatesService } from './route-coordinates.service';
import { CreateRouteCoordinatesDto } from './dto/create-routeCoordinates.dto';
import { UpdateRouteCoordinatesDto } from './dto/update-routeCoordinates.dto';
import { RouteCoordinatesResponse, RouteCoordinatesListResponse, RouteCoordinatesErrorResponse } from './dto/route-coordinates-response.dto';

@ApiTags('Routes Coordinates')
@Controller('route-coordinates')
export class RouteCoordinatesController {
  constructor(private readonly routeCoordinatesService: RouteCoordinatesService) {}

  @Post('')
  @ApiOperation({ summary: 'Create new route coordinates' })
  @ApiBody({ type: CreateRouteCoordinatesDto, description: 'Route coordinates data to create' })
  @ApiResponse({
    status: 201,
    description: 'Route coordinates created successfully',
    type: RouteCoordinatesResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
    type: RouteCoordinatesErrorResponse,
  })
  async create(@Body() createRouteCoordinatesDto: CreateRouteCoordinatesDto) {
    const newRouteCoordinates = await this.routeCoordinatesService.create(createRouteCoordinatesDto);
    return {
      success: true,
      message: 'Route coordinates created successfully',
      data: new RouteCoordinatesResponse(newRouteCoordinates),
    };
  }


  @Post('batch')
  @ApiOperation({ summary: 'Create multiple route coordinates in batch' })
  @ApiBody({ 
    type: [CreateRouteCoordinatesDto], 
    description: 'Array of route coordinates data to create' 
  })
  @ApiResponse({
    status: 201,
    description: 'Route coordinates created successfully',
    schema: {
      example: {
        success: true,
        message: 'Route coordinates batch created successfully',
        data: [], 
        total: 0  
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
    type: RouteCoordinatesErrorResponse,
  })
  async createBatch(@Body() createRouteCooridnatesDtos: CreateRouteCoordinatesDto[]) {
    const newRouteCoordinates = await this.routeCoordinatesService.createBatch(createRouteCooridnatesDtos);
    return {
      success: true,
      message: 'Route coordinates batch created successfully',
      data: newRouteCoordinates.map(coord => new RouteCoordinatesResponse(coord)),
      total: newRouteCoordinates.length
    };
  }


  @Get()
  @ApiOperation({ summary: 'Get all route coordinates' })
  @ApiResponse({
    status: 200,
    description: 'Route coordinates retrieved successfully',
    type: RouteCoordinatesListResponse,
  })
  async findAll() {
    const routeCoordinates = await this.routeCoordinatesService.findAll();
    return {
      success: true,
      message: 'Route coordinates retrieved successfully',
      data: routeCoordinates.map(coord => new RouteCoordinatesResponse(coord)),
      total: routeCoordinates.length,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get route coordinates by ID' })
  @ApiParam({ name: 'id', description: 'Route coordinates ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Route coordinates retrieved successfully',
    type: RouteCoordinatesResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Route coordinates not found',
    type: RouteCoordinatesErrorResponse,
  })
  async findOne(@Param('id') id: string) {
    const routeCoordinates = await this.routeCoordinatesService.findOne(id);
    if (!routeCoordinates) {
      throw new NotFoundException(`Route Coordinates with ID ${id} not found`);
    }
    return {
      success: true,
      message: 'Route coordinates retrieved successfully',
      data: new RouteCoordinatesResponse(routeCoordinates),
    };
  }

  @Get('route/:routeId')
  @ApiTags('FOR MOBILE USE')
  @ApiOperation({ summary: 'Get all route coordinates for a specific route' })
  @ApiParam({ name: 'routeId', description: 'Route ID', example: 'e5a53ba6-deda-11ef-9da2-54ee75718d0f' })
  @ApiResponse({
    status: 200,
    description: 'Route coordinates retrieved successfully for the route',
    type: RouteCoordinatesListResponse,
  })
  async findByRoute(@Param('routeId') routeId: string) {
    const routeCoordinates = await this.routeCoordinatesService.findByRoute(routeId);
    return {
      success: true,
      message: 'Route coordinates retrieved successfully for the route',
      data: routeCoordinates.map(coord => new RouteCoordinatesResponse(coord)),
      total: routeCoordinates.length,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update route coordinates' })
  @ApiParam({ name: 'id', description: 'Route coordinates ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ type: CreateRouteCoordinatesDto, description: 'Route coordinates data to update' })
  @ApiResponse({
    status: 200,
    description: 'Route coordinates updated successfully',
    type: RouteCoordinatesResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Route coordinates not found',
    type: RouteCoordinatesErrorResponse,
  })
  async update(@Param('id') id: string, @Body() updateRouteCoordinatesDto: UpdateRouteCoordinatesDto) {
    const updatedRouteCoordinates = await this.routeCoordinatesService.update(id, updateRouteCoordinatesDto);
    return {
      success: true,
      message: 'Route coordinates updated successfully',
      data: new RouteCoordinatesResponse(updatedRouteCoordinates),
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete route coordinates' })
  @ApiParam({ name: 'id', description: 'Route coordinates ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Route coordinates deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Route coordinates deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Route coordinates not found',
    type: RouteCoordinatesErrorResponse,
  })
  async remove(@Param('id') id: string) {
    await this.routeCoordinatesService.remove(id);
    return {
      success: true,
      message: 'Route coordinates deleted successfully',
    };
  }



  @Delete('route/:routeId')
  @ApiOperation({ summary: 'Delete all route coordinates for a specific route' })
  @ApiParam({ name: 'routeId', description: 'Route ID', example: 'e5a53ba6-deda-11ef-9da2-54ee75718d0f' })
  @ApiResponse({
    status: 200,
    description: 'Route coordinates deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'All route coordinates deleted successfully',
        affected: 5,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Route not found',
    type: RouteCoordinatesErrorResponse,
  })
  async removeByRouteId(@Param('routeId') routeId: string) {
    try {
      const result = await this.routeCoordinatesService.removeAllByRouteId(routeId);
      
      if (result.affected === 0) {
        return {
          success: true,
          message: 'Route is empty. No coordinates were deleted.',
          affected: 0,
        };
      }
      
      return {
        success: true,
        message: 'All route coordinates deleted successfully',
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