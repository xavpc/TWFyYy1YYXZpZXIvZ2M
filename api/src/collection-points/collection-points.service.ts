import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CollectionPoints } from './collection-points.entity';
import { CreateCollectionPointsDto } from './dto/create-collection-points.dto';
import { UpdateCollectionPointsDto } from './dto/update-collection-points.dto';
import { Route } from '../route/route.entity';

@Injectable()
export class CollectionPointsService {
  constructor(
    @InjectRepository(CollectionPoints)
    private collectionPointsRepository: Repository<CollectionPoints>,
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
  ) {}

  async create(CreateCollectionPointsDto: CreateCollectionPointsDto): Promise<CollectionPoints> {
    const collectionPoint = this.collectionPointsRepository.create(CreateCollectionPointsDto);
    
    if (CreateCollectionPointsDto.route_id) {
      const route = await this.routeRepository.findOne({
        where: { route_id: CreateCollectionPointsDto.route_id }
      });
      
      if (!route) {
        throw new NotFoundException(
          `Route with ID ${CreateCollectionPointsDto.route_id} not found`
        );
      }
      
      collectionPoint.route = route;
    }

    return this.collectionPointsRepository.save(collectionPoint);
  }

  findAll(): Promise<CollectionPoints[]> {
    return this.collectionPointsRepository.find({
      relations: ['route']
    });
  }

  async findOne(id: string): Promise<CollectionPoints> {
    const collectionPoint = await this.collectionPointsRepository.findOne({
      where: { collection_point_id: id },
      relations: ['route']
    });
    if (!collectionPoint) {
      throw new NotFoundException(`Collection Point with ID ${id} not found`);
    }
    return collectionPoint;
  }

  async update(id: string, UpdateCollectionPointsDto: UpdateCollectionPointsDto): Promise<CollectionPoints> {
    const collectionPoint = await this.findOne(id);
    
    if (UpdateCollectionPointsDto.route_id) {
      const route = await this.routeRepository.findOne({
        where: { route_id: UpdateCollectionPointsDto.route_id }
      });
      
      if (!route) {
        throw new NotFoundException(
          `Route with ID ${UpdateCollectionPointsDto.route_id} not found`
        );
      }
      
      collectionPoint.route = route;
    }
    
    Object.assign(collectionPoint, UpdateCollectionPointsDto);
    return this.collectionPointsRepository.save(collectionPoint);
  }

  async remove(id: string): Promise<void> {
    const result = await this.collectionPointsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Collection Point with ID ${id} not found`);
    }
  }

  findByRoute(routeId: string): Promise<CollectionPoints[]> {
    return this.collectionPointsRepository.find({
      where: { route: { route_id: routeId } },
      relations: ['route']
    });
  }

  async findByName(name: string): Promise<CollectionPoints> {
    const collectionPoint = await this.collectionPointsRepository.findOne({
      where: { collection_point_name: name },
      relations: ['route']
    });
    if (!collectionPoint) {
      throw new NotFoundException(`Collection Point with name ${name} not found`);
    }
    return collectionPoint;
  }
}