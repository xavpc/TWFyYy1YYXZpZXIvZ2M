import { Controller, Get, Query } from '@nestjs/common';
import { GmapsRoutingService } from './gmaps.service';

@Controller('gmaps-routing')
export class GmapsRoutingController {
  constructor(private readonly gmapsRoutingService: GmapsRoutingService) {}

  @Get()
  async getCarRoute(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
    @Query('waypoints') waypoints?: string,
  ) {
    try {
      const originCoords = origin.split(',').map(Number);
      const destCoords = destination.split(',').map(Number);

      if (originCoords.length !== 2 || destCoords.length !== 2 ||
          originCoords.some(isNaN) || destCoords.some(isNaN)) {
        throw new Error('Invalid coordinates format');
      }

      let waypointCoords: [number, number][] = [];
      if (waypoints) {
        waypointCoords = waypoints.split('|').map(wp => {
          const coords = wp.split(',').map(Number);
          if (coords.length !== 2 || coords.some(isNaN)) {
            throw new Error('Invalid waypoint format');
          }
          return [coords[0], coords[1]] as [number, number];
        });
      }

      return await this.gmapsRoutingService.getRoute(
        [originCoords[0], originCoords[1]],
        [destCoords[0], destCoords[1]],
        waypointCoords
      );
    } catch (error) {
      console.error('Car routing error:', error);
      throw error;
    }
  }
}
