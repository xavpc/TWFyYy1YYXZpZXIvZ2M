import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { RouteCoordinates } from './route-coordinates.entity';
import { CreateRouteCoordinatesDto } from './dto/create-routeCoordinates.dto';
import { UpdateRouteCoordinatesDto } from './dto/update-routeCoordinates.dto';
import { Route } from '../route/route.entity';
import { GmapsRoutingService } from 'src/third-party/routing-engine/google-maps/gmaps.service';

@Injectable()
export class RouteCoordinatesService {
  constructor(
    @InjectRepository(RouteCoordinates)
    private RouteCoordinatesRepository: Repository<RouteCoordinates>,
    @InjectRepository(Route)
    private RouteRepository: Repository<Route>,
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
    const coordinates = await this.RouteCoordinatesRepository.find({
      where: { route: { route_id: routeId } },
      order: { sequence: 'ASC' }
    });

    if (coordinates.length >= 3) {
      const centerPoint = this.calculateCenterPoint(coordinates);
      
      await this.RouteRepository.update(routeId, {
        center_latitude: centerPoint.latitude,
        center_longitude: centerPoint.longitude
      });
    }
  }

  async create(createRouteCoordinatesDto: CreateRouteCoordinatesDto): Promise<RouteCoordinates> {
    const route = await this.RouteRepository.findOne({
      where: { route_id: createRouteCoordinatesDto.route_id }
    });
    
    if (!route) {
      throw new NotFoundException(
        `Route with ID ${createRouteCoordinatesDto.route_id} not found`
      );
    }

    const existingCoordinates = await this.RouteCoordinatesRepository.count({
      where: { route: { route_id: createRouteCoordinatesDto.route_id } }
    });

    const routeCoordinates = this.RouteCoordinatesRepository.create({
      ...createRouteCoordinatesDto,
      sequence: existingCoordinates + 1,
      route: route
    });

    await this.RouteCoordinatesRepository.save(routeCoordinates);

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
  
    const route = await this.RouteRepository.findOne({
      where: { route_id: routeId }
    });
    
    if (!route) {
      throw new NotFoundException(`Route with ID ${routeId} not found`);
    }
  
    const entities = dtos.map(dto => {
      return this.RouteCoordinatesRepository.create({
        latitude: dto.latitude,
        longitude: dto.longitude,
        sequence: dto.sequence,
        is_user_point: dto.is_user_point,
        route: route
      });
    });
  
    const savedCoordinates = await this.RouteCoordinatesRepository.save(entities);
    
    await this.updateRouteCenterPoint(routeId);
    
    return savedCoordinates;
  }


  async findAll(): Promise<RouteCoordinates[]> {
    return this.RouteCoordinatesRepository.find({
      relations: ['route'],
      order: { sequence: 'ASC' }
    });
  }

  async findOne(id: string): Promise<RouteCoordinates> {
    const routeCoordinates = await this.RouteCoordinatesRepository.findOne({
      where: { route_coordinates_id: id },
      relations: ['route']
    });
    if (!routeCoordinates) {
      throw new NotFoundException(`Route Coordinates with ID ${id} not found`);
    }
    return routeCoordinates;
  }

  async update(id: string, updateRouteCoordinatesDto: UpdateRouteCoordinatesDto): Promise<RouteCoordinates> {
    const routeCoordinates = await this.findOne(id);
    Object.assign(routeCoordinates, updateRouteCoordinatesDto);
    await this.RouteCoordinatesRepository.save(routeCoordinates);

    await this.updateRouteCenterPoint(routeCoordinates.route.route_id);

    return routeCoordinates;
  }

  async remove(id: string): Promise<void> {
    const routeCoordinates = await this.findOne(id);
    const routeId = routeCoordinates.route.route_id;
    const currentSequence = routeCoordinates.sequence;

    const result = await this.RouteCoordinatesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Route Coordinates with ID ${id} not found`);
    }

    await this.RouteCoordinatesRepository
      .createQueryBuilder()
      .update(RouteCoordinates)
      .set({ sequence: () => 'sequence - 1' })
      .where('route_id = :routeId AND sequence > :currentSequence', {
        routeId,
        currentSequence
      })
      .execute();

    await this.updateRouteCenterPoint(routeId);
  }

  async findByRoute(routeId: string): Promise<RouteCoordinates[]> {
    return this.RouteCoordinatesRepository.find({
      where: { route: { route_id: routeId } },
      relations: ['route'],
      order: { sequence: 'ASC' }
    });
  }


  async removeAllByRouteId(routeId: string): Promise<{ affected: number }> {
    const route = await this.RouteRepository.findOne({
      where: { route_id: routeId }
    });
    
    if (!route) {
      throw new NotFoundException(`Route with ID ${routeId} not found`);
    }
  
    const result = await this.RouteCoordinatesRepository
      .createQueryBuilder()
      .delete()
      .from(RouteCoordinates)
      .where('route.route_id = :routeId', { routeId })
      .execute();
    
    await this.RouteRepository.update(routeId, {
      center_latitude: 0,
      center_longitude: 0
    });
    
    return { affected: result.affected ?? 0 };
  }

async removeUserPointWithGeneratedPoints(id: string): Promise<void> {
  const userPoint = await this.findOne(id);
  
  if (!userPoint.is_user_point) {
    throw new Error('This operation can only be performed on user points');
  }

  const routeId = userPoint.route.route_id;

  // 1. Get all user points EXCEPT the one being deleted
  const remainingUserPoints = await this.RouteCoordinatesRepository.find({
    where: { 
      route: { route_id: routeId },
      is_user_point: true,
      route_coordinates_id: Not(id) // Exclude the one being deleted
    },
    order: { sequence: 'ASC' }
  });

  // 2. Delete ALL coordinates for this route (clean slate)
  await this.RouteCoordinatesRepository
    .createQueryBuilder()
    .delete()
    .from(RouteCoordinates)
    .where('route.route_id = :routeId', { routeId })
    .execute();

  // 3. If no user points remain, we're done
  if (remainingUserPoints.length === 0) {
    await this.RouteRepository.update(routeId, {
      center_latitude: 0,
      center_longitude: 0
    });
    return;
  }

  // 4. Rebuild everything from scratch
  await this.rebuildRouteFromUserPoints(routeId, remainingUserPoints);

  // 5. Update center point
  await this.updateRouteCenterPoint(routeId);
}

private async rebuildRouteFromUserPoints(routeId: string, userPoints: RouteCoordinates[]): Promise<void> {
  const route = await this.RouteRepository.findOne({
    where: { route_id: routeId }
  });

  if (!route) {
    throw new NotFoundException(`Route with ID ${routeId} not found`);
  }

  let currentSequence = 1;
  const allCoordinatesToSave: RouteCoordinates[] = [];

  for (let i = 0; i < userPoints.length; i++) {
    const userPoint = userPoints[i];

    // Add the user point
    const userCoordinate = this.RouteCoordinatesRepository.create({
      latitude: userPoint.latitude,
      longitude: userPoint.longitude,
      sequence: currentSequence++,
      is_user_point: true,
      route: route
    });
    allCoordinatesToSave.push(userCoordinate);

    // If there's a next user point, generate route between them
    if (i < userPoints.length - 1) {
      const nextUserPoint = userPoints[i + 1];

      try {
        const routeData = await this.gmapsRoutingService.getRoute(
          [userPoint.latitude, userPoint.longitude],
          [nextUserPoint.latitude, nextUserPoint.longitude]
        );

        // Add generated points (skip first and last as they're user points)
        for (let j = 1; j < routeData.coordinates.length - 1; j++) {
          const coord = routeData.coordinates[j];
          const generatedCoordinate = this.RouteCoordinatesRepository.create({
            latitude: coord.lat,
            longitude: coord.lng,
            sequence: currentSequence++,
            is_user_point: false,
            route: route
          });
          allCoordinatesToSave.push(generatedCoordinate);
        }
      } catch (error) {
        console.error(`Failed to generate route between user points:`, error);
        // Continue without generated points for this segment
      }
    }
  }

  // Save all coordinates in one batch
  await this.RouteCoordinatesRepository.save(allCoordinatesToSave);
}




}