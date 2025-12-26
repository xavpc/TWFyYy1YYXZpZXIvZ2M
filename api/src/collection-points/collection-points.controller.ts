import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { CollectionPointsService } from './collection-points.service';
import { CreateCollectionPointsDto } from './dto/create-collection-points.dto';
import { UpdateCollectionPointsDto } from './dto/update-collection-points.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Collection Points(API documentation still under development)')
@Controller('web.collection-points')
export class CollectionPointsController {
  constructor(private readonly collectionPointsService: CollectionPointsService) {}

  @Post('')
  async create(@Body() CreateCollectionPointsDto: CreateCollectionPointsDto) {
    const newCollectionPoint = await this.collectionPointsService.create(CreateCollectionPointsDto);
    return {
      success: true,
      message: 'Collection point created successfully',
      data: newCollectionPoint,
    };
  }

  @Get()
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
  async findOne(@Param('id') id: string) {
    const collectionPoint = await this.collectionPointsService.findOne(id);
    return {
      success: true,
      message: 'Collection point retrieved successfully',
      data: collectionPoint,
    };
  }

  @Get('route/:routeId')
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
  async findByName(@Param('name') name: string) {
    const collectionPoint = await this.collectionPointsService.findByName(name);
    return {
      success: true,
      message: 'Collection point retrieved successfully',
      data: collectionPoint,
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() UpdateCollectionPointsDto: UpdateCollectionPointsDto) {
    const updatedCollectionPoint = await this.collectionPointsService.update(id, UpdateCollectionPointsDto);
    return {
      success: true,
      message: 'Collection point updated successfully',
      data: updatedCollectionPoint,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.collectionPointsService.remove(id);
    return {
      success: true,
      message: 'Collection point deleted successfully',
    };
  }
}