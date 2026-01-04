// gmaps.controller.ts
import {
  Controller,
  Get,
  Query,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
  ServiceUnavailableException
} from '@nestjs/common';
import { GmapsRoutingService } from './gmaps.service';

@Controller('gmaps-routing')
export class GmapsRoutingController {
  constructor(private readonly gmapsRoutingService: GmapsRoutingService) { }

  @Get()
  async getCarRoute(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
    @Query('waypoints') waypoints?: string,
  ) {
    // --- Step 1: Handle User Input Errors ---
    if (!origin || !destination) {
      throw new BadRequestException('Missing required parameters: origin and destination.');
    }

    try {
      const originCoords = origin.split(',').map(Number);
      const destCoords = destination.split(',').map(Number);

      if (originCoords.length !== 2 || destCoords.length !== 2 ||
        originCoords.some(isNaN) || destCoords.some(isNaN)) {
        // Use NestJS's built-in exception for a 400 Bad Request
        throw new BadRequestException('Invalid coordinates format. Expected "lat,lng".');
      }

      let waypointCoords: [number, number][] = [];
      if (waypoints) {
        waypointCoords = waypoints.split('|').map(wp => {
          const coords = wp.split(',').map(Number);
          if (coords.length !== 2 || coords.some(isNaN)) {
            throw new BadRequestException('Invalid waypoint format. Expected "lat,lng|lat,lng".');
          }
          return [coords[0], coords[1]] as [number, number];
        });
      }

      // --- Step 2: Call the Service and Handle API Errors ---
      return await this.gmapsRoutingService.getRoute(
        [originCoords[0], originCoords[1]],
        [destCoords[0], destCoords[1]],
        waypointCoords
      );
    } catch (error) {
      // Log the original error for debugging purposes
      console.error('Car routing error in controller:', { message: error.message, stack: error.stack });

      // --- Step 3: Map Google API Errors to HTTP Responses ---
      const gmapsStatus = error.gmaps_status;

      switch (gmapsStatus) {
        case 'NOT_FOUND':
        case 'ZERO_RESULTS':
          throw new NotFoundException(error.message || 'No route could be found for the given locations.');

        case 'INVALID_REQUEST':
          throw new BadRequestException(error.message || 'The request sent to the routing service was malformed.');

        case 'REQUEST_DENIED':
          throw new ForbiddenException(error.message || 'Access to the routing service was denied. Check API key and permissions.');

        case 'OVER_QUERY_LIMIT':
          throw new ServiceUnavailableException('The routing service is temporarily unavailable due to high demand. Please try again later.');

        case 'UNKNOWN_ERROR':
          throw new ServiceUnavailableException('An unknown error occurred with the routing service. Please try again.');

        default:
          // For any other errors (including network issues from axios), return a generic 500
          throw new InternalServerErrorException('An unexpected error occurred while processing the route.');
      }
    }
  }
}