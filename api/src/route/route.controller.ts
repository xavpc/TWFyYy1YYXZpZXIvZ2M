import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { RouteService } from './route.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { RouteResponse, RouteListResponse, ErrorResponse } from './dto/response.dto'; // New response DTOs

@ApiTags('Routes')
@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Post('')
  @ApiOperation({ summary: 'Create a new route' })
  @ApiBody({ type: CreateRouteDto, description: 'Route data to create' })
  @ApiResponse({
    status: 201,
    description: 'Route created successfully',
    type: RouteResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
    type: ErrorResponse,
  })
  async create(@Body() createRouteDto: CreateRouteDto) {
    const newRoute = await this.routeService.create(createRouteDto);
    return {
      success: true,
      message: 'Route created successfully',
      data: newRoute,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all routes' })
  @ApiResponse({
    status: 200,
    description: 'Routes retrieved successfully',
    type: RouteListResponse,
  })
  async findAll() {
    const routes = await this.routeService.findAll();
    return {
      success: true,
      message: 'Routes retrieved successfully',
      data: routes,
      total: routes.length,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a route by ID' })
  @ApiParam({ name: 'id', description: 'Route ID', example: 'e5a53ba6-deda-11ef-9da2-54ee75718d0f' })
  @ApiResponse({
    status: 200,
    description: 'Route retrieved successfully',
    type: RouteResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Route not found',
    type: ErrorResponse,
  })
  async findOne(@Param('id') id: string) {
    const route = await this.routeService.findOne(id);
    if (!route) {
      throw new NotFoundException(`Route with ID ${id} not found`);
    }
    return {
      success: true,
      message: 'Route retrieved successfully',
      data: route,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a route' })
  @ApiParam({ name: 'id', description: 'Route ID', example: 'e5a53ba6-deda-11ef-9da2-54ee75718d0f' })
  @ApiBody({ type: CreateRouteDto, description: 'Route data to update' })
  @ApiResponse({
    status: 200,
    description: 'Route updated successfully',
    type: RouteResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Route not found',
    type: ErrorResponse,
  })
  async update(@Param('id') id: string, @Body() updateRouteDto: UpdateRouteDto) {
    const updatedRoute = await this.routeService.update(id, updateRouteDto);
    return {
      success: true,
      message: 'Route updated successfully',
      data: updatedRoute,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a route' })
  @ApiParam({ name: 'id', description: 'Route ID', example: 'e5a53ba6-deda-11ef-9da2-54ee75718d0f' })
  @ApiResponse({
    status: 200,
    description: 'Route deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Route deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Route not found',
    type: ErrorResponse,
  })
  async remove(@Param('id') id: string) {
    await this.routeService.remove(id);
    return {
      success: true,
      message: 'Route deleted successfully',
    };
  }
}
