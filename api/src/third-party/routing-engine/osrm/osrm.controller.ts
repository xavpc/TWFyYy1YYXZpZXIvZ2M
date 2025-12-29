import { Controller, Get, Query } from '@nestjs/common';
import { OsrmService } from './osrm.service';

@Controller('osrm')
export class OsrmController {
  constructor(private readonly osrmService: OsrmService) {}

  @Get('route')
  async getRoute(
    @Query('start') start: string,
    @Query('end') end: string
  ) {
    const startCoords = start.split(',').map(Number) as [number, number];
    const endCoords = end.split(',').map(Number) as [number, number];

    return this.osrmService.getRoute(startCoords, endCoords);
  }
}
