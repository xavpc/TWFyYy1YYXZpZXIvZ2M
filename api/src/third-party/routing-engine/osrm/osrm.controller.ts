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
    try {
      const startCoords = start.split(',').map(Number);
      const endCoords = end.split(',').map(Number);


      if (startCoords.length !== 2 || endCoords.length !== 2 ||
          startCoords.some(isNaN) || endCoords.some(isNaN)) {
        throw new Error('Invalid coordinates format');
      }


      return await this.osrmService.getRoute(
        [startCoords[0], startCoords[1]],
        [endCoords[0], endCoords[1]]
      );
    } catch (error) {
      console.error('Route error:', error);
      throw error;
    }
  }
}