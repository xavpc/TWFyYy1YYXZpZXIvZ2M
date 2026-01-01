import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RouteCoordinates } from './route-coordinates.entity';
import { CreateRouteCoordinatesDto } from './dto/create-routeCoordinates.dto';
import { UpdateRouteCoordinatesDto } from './dto/update-routeCoordinates.dto';
import { Route } from '../route/route.entity';

@Injectable()
export class RouteCoordinatesService {
  constructor(
    @InjectRepository(RouteCoordinates)
    private RouteCoordinatesRepository: Repository<RouteCoordinates>,
    @InjectRepository(Route)
    private RouteRepository: Repository<Route>,
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
    const userPointSequence = userPoint.sequence;

    const allCoordinates = await this.RouteCoordinatesRepository.find({
      where: { route: { route_id: routeId } },
      order: { sequence: 'ASC' }
    });

    // Find the previous and next user points
    const previousUserPoint = allCoordinates
      .filter(coord => coord.is_user_point && coord.sequence < userPointSequence)
      .pop(); // Get the last one (closest to current)

    const nextUserPoint = allCoordinates
      .find(coord => coord.is_user_point && coord.sequence > userPointSequence);

    // Determine the range of sequences to delete
    let startSequence: number;
    let endSequence: number;

    if (!previousUserPoint && !nextUserPoint) {
      // This is the only user point, delete everything
      startSequence = 1;
      endSequence = Math.max(...allCoordinates.map(c => c.sequence));
    } else if (!previousUserPoint) {
      // This is the first user point, delete from start to next user point (exclusive)
      startSequence = 1;
      endSequence = nextUserPoint!.sequence - 1; // We know nextUserPoint exists here
    } else if (!nextUserPoint) {
      // This is the last user point, delete from previous user point (exclusive) to end
      startSequence = previousUserPoint.sequence + 1;
      endSequence = Math.max(...allCoordinates.map(c => c.sequence));
    } else {
      // There are user points before and after, delete the segment between them
      startSequence = previousUserPoint.sequence + 1;
      endSequence = nextUserPoint.sequence - 1;
    }

    // Delete all coordinates in the determined range
    await this.RouteCoordinatesRepository
      .createQueryBuilder()
      .delete()
      .from(RouteCoordinates)
      .where('route_id = :routeId AND sequence >= :startSequence AND sequence <= :endSequence', {
        routeId,
        startSequence,
        endSequence
      })
      .execute();

    await this.resequenceCoordinates(routeId);

    await this.updateRouteCenterPoint(routeId);
  }

  private async resequenceCoordinates(routeId: string): Promise<void> {
    const remainingCoordinates = await this.RouteCoordinatesRepository.find({
      where: { route: { route_id: routeId } },
      order: { sequence: 'ASC' }
    });

    for (let i = 0; i < remainingCoordinates.length; i++) {
      await this.RouteCoordinatesRepository.update(
        remainingCoordinates[i].route_coordinates_id,
        { sequence: i + 1 }
      );
    }
  }



}