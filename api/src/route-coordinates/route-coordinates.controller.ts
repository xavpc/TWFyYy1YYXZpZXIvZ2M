import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { RouteCoordinatesService } from './route-coordinates.service';
import { CreateRouteCoordinatesDto } from './dto/create-routeCoordinates.dto';
import { UpdateRouteCoordinatesDto } from './dto/update-routeCoordinates.dto';
import { RouteCoordinatesResponse, RouteCoordinatesListResponse, ErrorResponse } from './dto/response.dto';

@ApiTags('Routes Coordinates')
@Controller('web.route-coordinates')
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
    type: ErrorResponse,
  })
  async create(@Body() createRouteCoordinatesDto: CreateRouteCoordinatesDto) {
    const newRouteCoordinates = await this.routeCoordinatesService.create(createRouteCoordinatesDto);
    return {
      success: true,
      message: 'Route coordinates created successfully',
      data: new RouteCoordinatesResponse(newRouteCoordinates),
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
    type: ErrorResponse,
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
    type: ErrorResponse,
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
    type: ErrorResponse,
  })
  async remove(@Param('id') id: string) {
    await this.routeCoordinatesService.remove(id);
    return {
      success: true,
      message: 'Route coordinates deleted successfully',
    };
  }
}