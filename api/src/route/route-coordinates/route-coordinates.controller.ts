import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { RouteCoordinatesService } from './route-coordinates.service';
import { CreateRouteCoordinatesDto } from './dto/create-routeCoordinates.dto';
import { UpdateRouteCoordinatesDto } from './dto/update-routeCoordinates.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Routes Coordinates(still under development)')
@Controller('web.route-coordinates')
export class RouteCoordinatesController {
  constructor(private readonly routeCoordinatesService: RouteCoordinatesService) {}

  @Post('')
  async create(@Body() createRouteCoordinatesDto: CreateRouteCoordinatesDto) {
    console.log('Received DTO:', createRouteCoordinatesDto); 
    const newRouteCoordinates = await this.routeCoordinatesService.create(createRouteCoordinatesDto);
    return {
      success: true,
      message: 'Route coordinates created successfully',
      data: newRouteCoordinates,
    };
  }

  @Get()
  async findAll() {
    const routeCoordinates = await this.routeCoordinatesService.findAll();
    return {
      success: true,
      message: 'Route coordinates retrieved successfully',
      data: routeCoordinates,
      total: routeCoordinates.length,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const routeCoordinates = await this.routeCoordinatesService.findOne(id);
    if (!routeCoordinates) {
      throw new NotFoundException(`Route Coordinates with ID ${id} not found`);
    }
    return {
      success: true,
      message: 'Route coordinates retrieved successfully',
      data: routeCoordinates,
    };
  }

  @Get('route/:routeId')
  async findByRoute(@Param('routeId') routeId: string) {
    const routeCoordinates = await this.routeCoordinatesService.findByRoute(routeId);
    return {
      success: true,
      message: 'Route coordinates retrieved successfully for the route',
      data: routeCoordinates,
      total: routeCoordinates.length,
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateRouteCoordinatesDto: UpdateRouteCoordinatesDto) {
    const updatedRouteCoordinates = await this.routeCoordinatesService.update(id, updateRouteCoordinatesDto);
    return {
      success: true,
      message: 'Route coordinates updated successfully',
      data: updatedRouteCoordinates,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.routeCoordinatesService.remove(id);
    return {
      success: true,
      message: 'Route coordinates deleted successfully',
    };
  }
}
