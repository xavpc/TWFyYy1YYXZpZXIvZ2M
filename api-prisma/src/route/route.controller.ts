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
import { RouteService } from './route.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { FilterRouteDto } from './dto/filter-route.dto';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiBody, 
  ApiQuery 
} from '@nestjs/swagger';
import { RouteResponse, RouteListResponse, RouteErrorResponse } from './dto/response.dto';

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
    type: RouteErrorResponse,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Route name already exists',
    type: RouteErrorResponse,
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
  @ApiOperation({ summary: 'Get all routes with optional filtering, searching, and pagination' })
  @ApiQuery({ type: FilterRouteDto, required: false })
  @ApiResponse({
    status: 200,
    description: 'Routes retrieved successfully',
    type: RouteListResponse,
  })
  async findAll(@Query() filterDto?: FilterRouteDto) {
    const result = await this.routeService.findAll(filterDto);
    return {
      success: true,
      message: 'Routes retrieved successfully',
      data: result.data,
      total: result.total,
      pagination: filterDto ? {
        page: filterDto.page || 1,
        limit: filterDto.limit || 10,
        total_pages: Math.ceil(result.total / (filterDto.limit || 10))
      } : undefined
    };
  }

  @Get('search/global')
  @ApiOperation({ summary: 'Global search across routes and related entities' })
  @ApiQuery({ 
    name: 'term', 
    description: 'Search term to find across route name, ID, and assigned device information',
    example: 'Downtown'
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
    type: RouteListResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'No routes found matching search term',
    type: RouteErrorResponse,
  })
  async globalSearch(@Query('term') searchTerm: string) {
    const routes = await this.routeService.globalSearch(searchTerm);
    return {
      success: true,
      message: `Found ${routes.length} routes matching '${searchTerm}'`,
      data: routes,
      total: routes.length,
    };
  }

  @Get('search/field')
  @ApiOperation({ summary: 'Search routes by specific field' })
  @ApiQuery({ 
    name: 'field', 
    description: 'Field to search in',
    enum: ['route_name', 'route_id'],
    example: 'route_name'
  })
  @ApiQuery({ 
    name: 'value', 
    description: 'Value to search for',
    example: 'Main'
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
    type: RouteListResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'No routes found or invalid field',
    type: RouteErrorResponse,
  })
  async searchByField(
    @Query('field') field: 'route_name' | 'route_id',
    @Query('value') value: string
  ) {
    const routes = await this.routeService.searchByField(field, value);
    return {
      success: true,
      message: `Found ${routes.length} routes matching ${field}: ${value}`,
      data: routes,
      total: routes.length,
    };
  }

  @Get('search/coordinates')
  @ApiOperation({ summary: 'Find routes within coordinate range' })
  @ApiQuery({ name: 'min_lat', description: 'Minimum latitude', example: '35.6' })
  @ApiQuery({ name: 'max_lat', description: 'Maximum latitude', example: '35.7' })
  @ApiQuery({ name: 'min_lng', description: 'Minimum longitude', example: '139.6' })
  @ApiQuery({ name: 'max_lng', description: 'Maximum longitude', example: '139.7' })
  @ApiResponse({
    status: 200,
    description: 'Routes within coordinate range retrieved successfully',
    type: RouteListResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'No routes found within coordinate range',
    type: RouteErrorResponse,
  })
  async findByCoordinateRange(
    @Query('min_lat') minLat: string,
    @Query('max_lat') maxLat: string,
    @Query('min_lng') minLng: string,
    @Query('max_lng') maxLng: string
  ) {
    const routes = await this.routeService.findByCoordinateRange(
      parseFloat(minLat),
      parseFloat(maxLat),
      parseFloat(minLng),
      parseFloat(maxLng)
    );
    return {
      success: true,
      message: `Found ${routes.length} routes within specified coordinate range`,
      data: routes,
      total: routes.length,
    };
  }

  @Get('device/:deviceId')
  @ApiOperation({ summary: 'Get routes assigned to a specific device' })
  @ApiParam({ name: 'deviceId', description: 'Device ID', example: 'device-uuid' })
  @ApiResponse({
    status: 200,
    description: 'Routes assigned to device retrieved successfully',
    type: RouteListResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'No routes found for device',
    type: RouteErrorResponse,
  })
  async findByAssignedDevice(@Param('deviceId') deviceId: string) {
    const routes = await this.routeService.findByAssignedDevice(deviceId);
    return {
      success: true,
      message: `Found ${routes.length} routes assigned to device`,
      data: routes,
      total: routes.length,
    };
  }

  @Get('day/:day')
  @ApiOperation({ summary: 'Get routes assigned for a specific day' })
  @ApiParam({ 
    name: 'day', 
    description: 'Day of the week',
    enum: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
    example: 'MONDAY'
  })
  @ApiResponse({
    status: 200,
    description: 'Routes assigned for the day retrieved successfully',
    type: RouteListResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'No routes found for the specified day',
    type: RouteErrorResponse,
  })
  async findByDay(@Param('day') day: string) {
    const routes = await this.routeService.findByDay(day);
    return {
      success: true,
      message: `Found ${routes.length} routes assigned for ${day}`,
      data: routes,
      total: routes.length,
    };
  }

  @Get('analytics/with-image-count')
  @ApiOperation({ summary: 'Get all routes with image count statistics' })
  @ApiResponse({
    status: 200,
    description: 'Routes with image count retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Routes with image count retrieved successfully',
        data: [
          {
            route_id: 'uuid',
            route_name: 'Route A',
            center_latitude: 35.6895,
            center_longitude: 139.6917,
            image_count: 5,
            images: [],
            deviceRoutes: []
          }
        ],
        total: 1
      }
    }
  })
  async getRoutesWithImageCount() {
    const routes = await this.routeService.getRoutesWithImageCount();
    return {
      success: true,
      message: 'Routes with image count retrieved successfully',
      data: routes,
      total: routes.length,
    };
  }

  @Get('analytics/statistics')
  @ApiOperation({ summary: 'Get route statistics and analytics' })
  @ApiResponse({
    status: 200,
    description: 'Route statistics retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Route statistics retrieved successfully',
        data: {
          total_routes: 10,
          routes_with_assigned_devices: 8,
          routes_with_images: 6,
          routes_without_devices: 2
        }
      }
    }
  })
  async getRouteStatistics() {
    const statistics = await this.routeService.getRouteStatistics();
    return {
      success: true,
      message: 'Route statistics retrieved successfully',
      data: statistics,
    };
  }

  @Get('name/:routeName')
  @ApiOperation({ summary: 'Get a route by name' })
  @ApiParam({ name: 'routeName', description: 'Route name', example: 'Main Street' })
  @ApiResponse({
    status: 200,
    description: 'Route retrieved successfully',
    type: RouteResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Route not found',
    type: RouteErrorResponse,
  })
  async findByName(@Param('routeName') routeName: string) {
    const route = await this.routeService.findByName(routeName);
    return {
      success: true,
      message: 'Route retrieved successfully',
      data: route,
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
    type: RouteErrorResponse,
  })
  async findOne(@Param('id') id: string) {
    const route = await this.routeService.findOne(id);
    return {
      success: true,
      message: 'Route retrieved successfully',
      data: route,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a route' })
  @ApiParam({ name: 'id', description: 'Route ID', example: 'e5a53ba6-deda-11ef-9da2-54ee75718d0f' })
  @ApiBody({ type: UpdateRouteDto, description: 'Route data to update' })
  @ApiResponse({
    status: 200,
    description: 'Route updated successfully',
    type: RouteResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
    type: RouteErrorResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Route not found',
    type: RouteErrorResponse,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Route name already exists',
    type: RouteErrorResponse,
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
    type: RouteErrorResponse,
  })
  async remove(@Param('id') id: string) {
    await this.routeService.remove(id);
    return {
      success: true,
      message: 'Route deleted successfully',
    };
  }
}