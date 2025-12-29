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

  async create(createRouteCoordinatesDto: CreateRouteCoordinatesDto): Promise<RouteCoordinates> {
    const RouteCoordinates = this.RouteCoordinatesRepository.create(createRouteCoordinatesDto);
    
    if (createRouteCoordinatesDto.route_id) {
        const Route = await this.RouteRepository.findOne({
            where: { route_id: createRouteCoordinatesDto.route_id }
        });
        
        if (!Route) {
            throw new NotFoundException(
                `Route with ID ${createRouteCoordinatesDto.route_id} not found`
            );
        }
        
        const highestSequence = await this.RouteCoordinatesRepository.findOne({
            where: { route: { route_id: createRouteCoordinatesDto.route_id } },
            order: { sequence: 'DESC' }
        });
        
        RouteCoordinates.sequence = highestSequence ? highestSequence.sequence + 1 : 1;
        RouteCoordinates.route = Route;
    }

    return this.RouteCoordinatesRepository.save(RouteCoordinates);
  }

  findAll(): Promise<RouteCoordinates[]> {
    return this.RouteCoordinatesRepository.find({
      relations: ['route']
    });
  }

  async findOne(id: string): Promise<RouteCoordinates> {
    const RouteCoordinates = await this.RouteCoordinatesRepository.findOne({
      where: { route_coordinates_id: id },
      relations: ['route']
    });
    if (!RouteCoordinates) {
      throw new NotFoundException(`Route Coordinates with ID ${id} not found`);
    }
    return RouteCoordinates;
  }

  async update(id: string, updateRouteCoordinatesDto: UpdateRouteCoordinatesDto): Promise<RouteCoordinates> {
    const RouteCoordinates = await this.findOne(id);
    Object.assign(RouteCoordinates, updateRouteCoordinatesDto);
    return this.RouteCoordinatesRepository.save(RouteCoordinates);
  }

  async remove(id: string): Promise<void> {
    const result = await this.RouteCoordinatesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Route Coordinates with ID ${id} not found`);
    }
  }

  findByRoute(RouteId: string): Promise<RouteCoordinates[]> {
    return this.RouteCoordinatesRepository.find({
        where: { route: { route_id: RouteId } },
        relations: ['route'],
        order: { sequence: 'ASC' }  
    });
}
}