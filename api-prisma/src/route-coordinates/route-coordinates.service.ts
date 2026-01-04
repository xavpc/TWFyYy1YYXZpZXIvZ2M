import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RouteCoordinates } from '@prisma/client';
import { CreateRouteCoordinatesDto } from './dto/create-routeCoordinates.dto';
import { UpdateRouteCoordinatesDto } from './dto/update-routeCoordinates.dto';
import { GmapsRoutingService } from 'src/third-party/routing-engine/google-maps/gmaps.service';

@Injectable()
export class RouteCoordinatesService {
  constructor(
    private prisma: PrismaService,
    private gmapsRoutingService: GmapsRoutingService
  ) {}

  private calculateCenterPoint(coordinates: RouteCoordinates[]): { latitude: number; longitude: number } {
    if (coordinates.length === 0) {
      throw new Error('No coordinates provided');
    }

    const sumLat = coordinates.reduce((sum, coord) => sum + Number(coord.latitude), 0);
    const sumLng = coordinates.reduce((sum, coord) => sum + Number(coord.longitude), 0);

    return {
      latitude: Number((sumLat / coordinates.length).toFixed(6)),
      longitude: Number((sumLng / coordinates.length).toFixed(6))
    };
  }

  private async updateRouteCenterPoint(routeId: string): Promise<void> {
    const coordinates = await this.prisma.routeCoordinates.findMany({
      where: { route_id: routeId },
      orderBy: { sequence: 'asc' }
    });

    if (coordinates.length >= 3) {
      const centerPoint = this.calculateCenterPoint(coordinates);

      await this.prisma.route.update({
        where: { route_id: routeId },
        data: {
          center_latitude: centerPoint.latitude,
          center_longitude: centerPoint.longitude
        }
      });
    }
  }

  async create(createRouteCoordinatesDto: CreateRouteCoordinatesDto): Promise<RouteCoordinates> {
    const route = await this.prisma.route.findUnique({
      where: { route_id: createRouteCoordinatesDto.route_id }
    });

    if (!route) {
      throw new NotFoundException(
        `Route with ID ${createRouteCoordinatesDto.route_id} not found`
      );
    }

    const existingCoordinates = await this.prisma.routeCoordinates.count({
      where: { route_id: createRouteCoordinatesDto.route_id }
    });

    const routeCoordinates = await this.prisma.routeCoordinates.create({
      data: {
        latitude: createRouteCoordinatesDto.latitude,
        longitude: createRouteCoordinatesDto.longitude,
        sequence: existingCoordinates + 1,
        is_user_point: createRouteCoordinatesDto.is_user_point ?? true,
        route_id: createRouteCoordinatesDto.route_id
      }
    });

    await this.updateRouteCenterPoint(route.route_id);

    return routeCoordinates;
  }

  async createBatch(dtos: CreateRouteCoordinatesDto[]): Promise<RouteCoordinates[]> {
    if (!dtos.length) {
      return [];
    }

    const routeId = dtos[0].route_id;
    if (!dtos.every(dto => dto.route_id === routeId)) {
      throw new Error('All coordinates in batch must belong to the same route');
    }

    const route = await this.prisma.route.findUnique({
      where: { route_id: routeId }
    });

    if (!route) {
      throw new NotFoundException(`Route with ID ${routeId} not found`);
    }

    const savedCoordinates: RouteCoordinates[] = [];
    for (const dto of dtos) {
      const coord = await this.prisma.routeCoordinates.create({
        data: {
          latitude: dto.latitude,
          longitude: dto.longitude,
          sequence: dto.sequence,
          is_user_point: dto.is_user_point ?? true,
          route_id: routeId
        }
      });
      savedCoordinates.push(coord);
    }

    await this.updateRouteCenterPoint(routeId);

    return savedCoordinates;
  }


  async findAll(): Promise<RouteCoordinates[]> {
    return this.prisma.routeCoordinates.findMany({
      include: { route: true },
      orderBy: { sequence: 'asc' }
    });
  }

  async findOne(id: string): Promise<RouteCoordinates & { route: any }> {
    const routeCoordinates = await this.prisma.routeCoordinates.findUnique({
      where: { route_coordinates_id: id },
      include: { route: true }
    });
    if (!routeCoordinates) {
      throw new NotFoundException(`Route Coordinates with ID ${id} not found`);
    }
    return routeCoordinates;
  }

  async update(id: string, updateRouteCoordinatesDto: UpdateRouteCoordinatesDto): Promise<RouteCoordinates & { route: any }> {
    const routeCoordinates = await this.findOne(id);

    const updated = await this.prisma.routeCoordinates.update({
      where: { route_coordinates_id: id },
      data: updateRouteCoordinatesDto,
      include: { route: true }
    });

    await this.updateRouteCenterPoint(routeCoordinates.route.route_id);

    return updated;
  }

  async remove(id: string): Promise<void> {
    const routeCoordinates = await this.findOne(id);
    const routeId = routeCoordinates.route.route_id;
    const currentSequence = routeCoordinates.sequence;

    await this.prisma.routeCoordinates.delete({
      where: { route_coordinates_id: id }
    });

    // Decrement sequence for all coordinates with higher sequence in same route
    await this.prisma.routeCoordinates.updateMany({
      where: {
        route_id: routeId,
        sequence: { gt: currentSequence }
      },
      data: {
        sequence: { decrement: 1 }
      }
    });

    await this.updateRouteCenterPoint(routeId);
  }

  async findByRoute(routeId: string): Promise<RouteCoordinates[]> {
    return this.prisma.routeCoordinates.findMany({
      where: { route_id: routeId },
      include: { route: true },
      orderBy: { sequence: 'asc' }
    });
  }


  async removeAllByRouteId(routeId: string): Promise<{ affected: number }> {
    const route = await this.prisma.route.findUnique({
      where: { route_id: routeId }
    });

    if (!route) {
      throw new NotFoundException(`Route with ID ${routeId} not found`);
    }

    const result = await this.prisma.routeCoordinates.deleteMany({
      where: { route_id: routeId }
    });

    await this.prisma.route.update({
      where: { route_id: routeId },
      data: {
        center_latitude: 35.6763976,
        center_longitude: 139.6993259
      }
    });

    return { affected: result.count };
  }

  async removeUserPointWithGeneratedPoints(id: string): Promise<void> {
    const userPoint = await this.findOne(id);

    if (!userPoint.is_user_point) {
      throw new Error('This operation can only be performed on user points');
    }

    const routeId = userPoint.route.route_id;

    // 1. Get all user points EXCEPT the one being deleted
    const remainingUserPoints = await this.prisma.routeCoordinates.findMany({
      where: {
        route_id: routeId,
        is_user_point: true,
        route_coordinates_id: { not: id }
      },
      orderBy: { sequence: 'asc' }
    });

    // 2. Delete ALL coordinates for this route (clean slate)
    await this.prisma.routeCoordinates.deleteMany({
      where: { route_id: routeId }
    });

    // 3. If no user points remain, we're done
    if (remainingUserPoints.length === 0) {
      await this.prisma.route.update({
        where: { route_id: routeId },
        data: {
          center_latitude: 0,
          center_longitude: 0
        }
      });
      return;
    }

    // 4. Rebuild everything from scratch
    await this.rebuildRouteFromUserPoints(routeId, remainingUserPoints);

    // 5. Update center point
    await this.updateRouteCenterPoint(routeId);
  }

  private async rebuildRouteFromUserPoints(routeId: string, userPoints: RouteCoordinates[]): Promise<void> {
    const route = await this.prisma.route.findUnique({
      where: { route_id: routeId }
    });

    if (!route) {
      throw new NotFoundException(`Route with ID ${routeId} not found`);
    }

    let currentSequence = 1;
    const allCoordinatesToSave: Array<{
      latitude: number;
      longitude: number;
      sequence: number;
      is_user_point: boolean;
      route_id: string;
    }> = [];

    for (let i = 0; i < userPoints.length; i++) {
      const userPoint = userPoints[i];

      // Add the user point
      allCoordinatesToSave.push({
        latitude: Number(userPoint.latitude),
        longitude: Number(userPoint.longitude),
        sequence: currentSequence++,
        is_user_point: true,
        route_id: routeId
      });

      // If there's a next user point, generate route between them
      if (i < userPoints.length - 1) {
        const nextUserPoint = userPoints[i + 1];

        try {
          const routeData = await this.gmapsRoutingService.getRoute(
            [Number(userPoint.latitude), Number(userPoint.longitude)],
            [Number(nextUserPoint.latitude), Number(nextUserPoint.longitude)]
          );

          // Add generated points (skip first and last as they're user points)
          for (let j = 1; j < routeData.coordinates.length - 1; j++) {
            const coord = routeData.coordinates[j];
            allCoordinatesToSave.push({
              latitude: coord.lat,
              longitude: coord.lng,
              sequence: currentSequence++,
              is_user_point: false,
              route_id: routeId
            });
          }
        } catch (error) {
          console.error(`Failed to generate route between user points:`, error);
          // Continue without generated points for this segment
        }
      }
    }

    // Save all coordinates in batch
    for (const coord of allCoordinatesToSave) {
      await this.prisma.routeCoordinates.create({
        data: coord
      });
    }
  }
}
