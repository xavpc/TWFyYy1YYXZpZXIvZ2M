import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { DeviceLocationService } from './device-location.service';
import { CreateDeviceLocationDto } from './dto/create-deviceLocation.dto';
import { UpdateDeviceLocationDto } from './dto/update-deviceLocation.dto';

@Controller('mobile.device-locations')
export class DeviceLocationController {
  constructor(private readonly deviceLocationService: DeviceLocationService) {}

  @Post('')
  create(@Body() createDeviceLocationDto: CreateDeviceLocationDto) {
    return this.deviceLocationService.create(createDeviceLocationDto);
  }

  @Get()
  findAll() {
    return this.deviceLocationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deviceLocationService.findOne(id);
  }
  
  @Get('device/:deviceId')
  findByDevice(@Param('deviceId') deviceId: string) {
    return this.deviceLocationService.findByDevice(deviceId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDeviceLocationDto: UpdateDeviceLocationDto) {
    return this.deviceLocationService.update(id, updateDeviceLocationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deviceLocationService.remove(id);
  }
}