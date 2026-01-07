import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { CollectedPointsService } from './collected-points.service';
import { CreateCollectedPointsDto } from './dto/create-collected-points.dto';
import { UpdateCollectedPointsDto } from './dto/update-collected-points.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Collected Points(API documentation still under development)')
@Controller('mobile.collected-points')
export class CollectedPointsController {
  constructor(private readonly collectedPointsService: CollectedPointsService) {}

  @Post('')
  async create(@Body() createCollectedPointsDto: CreateCollectedPointsDto) {
    const newCollectedPoints = await this.collectedPointsService.create(createCollectedPointsDto);
    return {
      success: true,
      message: 'Collected points created successfully',
      data: newCollectedPoints,
    };
  }

  @Get()
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
  async findOne(@Param('id') id: string) {
    const collectedPoints = await this.collectedPointsService.findOne(id);
    if (!collectedPoints) {
      throw new NotFoundException(`Device Route with ID ${id} not found`);
    }
    return {
      success: true,
      message: 'Collected points retrieved successfully',
      data: collectedPoints,
    };
  }

  @Get('device/:deviceId')
  async findByDevice(@Param('deviceId') deviceId: string) {
    const collectedPointss = await this.collectedPointsService.findByDevice(deviceId);
    return {
      success: true,
      message: 'Collected pointss retrieved successfully for the device',
      data: collectedPointss,
      total: collectedPointss.length,
    };
  }

  @Get('collection-point/:collectionPointId')
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
  async update(@Param('id') id: string, @Body() updateCollectedPointsDto: UpdateCollectedPointsDto) {
    const updatedCollectedPoints = await this.collectedPointsService.update(id, updateCollectedPointsDto);
    return {
      success: true,
      message: 'Collected points updated successfully',
      data: updatedCollectedPoints,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.collectedPointsService.remove(id);
    return {
      success: true,
      message: 'Collected points deleted successfully',
    };
  }
}