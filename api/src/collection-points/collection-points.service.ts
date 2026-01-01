import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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


// SERVICE METHOD - Updated createBatch method
async createBatch(dtos: CreateCollectionPointsDto[]): Promise<CollectionPoints[]> {
  if (!dtos.length) {
    return [];
  }

  // Check for duplicate sequences within the batch
  const sequences = dtos.map(dto => dto.sequence);
  const duplicateSequences = sequences.filter((sequence, index) => sequences.indexOf(sequence) !== index);
  if (duplicateSequences.length > 0) {
    throw new ConflictException(
      `Duplicate sequences found in batch: ${[...new Set(duplicateSequences)].join(', ')}`
    );
  }

  // Validate that all collection points belong to the same route (if route_id is provided)
  const routeIds = [...new Set(dtos.map(dto => dto.route_id).filter(Boolean))];
  if (routeIds.length > 1) {
    throw new ConflictException('All collection points in batch must belong to the same route');
  }

  let route: Route | null = null;
  if (routeIds.length === 1) {
    route = await this.routeRepository.findOne({
      where: { route_id: routeIds[0] }
    });

    if (!route) {
      throw new NotFoundException(`Route with ID ${routeIds[0]} not found`);
    }
  }

  // If we have a route, validate sequence ordering
  if (route) {
    // Get existing collection points for this route, ordered by sequence
    const existingCollectionPoints = await this.collectionPointsRepository.find({
      where: { route: { route_id: route.route_id } },
      order: { sequence: 'ASC' }
    });

    const existingSequences = existingCollectionPoints.map(cp => cp.sequence);
    const newSequences = sequences.sort((a, b) => a - b);

    // Check for duplicate sequences with existing data
    const conflictingSequences = newSequences.filter(seq => existingSequences.includes(seq));
    if (conflictingSequences.length > 0) {
      throw new ConflictException(
        `Sequences ${conflictingSequences.join(', ')} already exist in route ${route.route_id}`
      );
    }

    // Validate sequence ordering
    const allSequences = [...existingSequences, ...newSequences].sort((a, b) => a - b);
    
    // Check if sequences are consecutive starting from 1
    for (let i = 0; i < allSequences.length; i++) {
      if (allSequences[i] !== i + 1) {
        throw new ConflictException(
          `Invalid sequence order. Expected sequence ${i + 1} but found ${allSequences[i]}. ` +
          `Sequences must be consecutive starting from 1. Current sequences would be: ${allSequences.join(', ')}`
        );
      }
    }
  } else {
    // If no route specified, just validate that the new sequences are consecutive starting from 1
    const sortedSequences = sequences.sort((a, b) => a - b);
    for (let i = 0; i < sortedSequences.length; i++) {
      if (sortedSequences[i] !== i + 1) {
        throw new ConflictException(
          `Invalid sequence order. Sequences must be consecutive starting from 1. Found: ${sortedSequences.join(', ')}`
        );
      }
    }
  }

  // Create entities
  const entities = dtos.map(dto => {
    const entity = this.collectionPointsRepository.create({
      collection_point_name: dto.collection_point_name,
      latitude: dto.latitude,
      longitude: dto.longitude,
      sequence: dto.sequence,
    });

    if (route) {
      entity.route = route;
    }

    return entity;
  });

  // Save all entities
  const savedCollectionPoints = await this.collectionPointsRepository.save(entities);

  return savedCollectionPoints;
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
    await this.collectionPointsRepository.manager.transaction(async manager => {
      const collectionPointToDelete = await manager.findOne(CollectionPoints, {
        where: { collection_point_id: id },
        relations: ['route']
      });

      if (!collectionPointToDelete) {
        throw new NotFoundException(`Collection Point with ID ${id} not found`);
      }

      const routeId = collectionPointToDelete.route.route_id;
      const deletedSequence = collectionPointToDelete.sequence;

      await manager.delete(CollectionPoints, id);


      await manager
        .createQueryBuilder()
        .update(CollectionPoints)
        .set({ 
          sequence: () => 'sequence - 1' 
        })
        .where('route.route_id = :routeId', { routeId })
        .andWhere('sequence > :deletedSequence', { deletedSequence })
        .execute();
    });
  }

  async removeBySequence(route_id: string, sequence: number): Promise<void> {
    const collectionPoint = await this.collectionPointsRepository.findOne({
      where: { 
        route: { route_id }, 
        sequence 
      },
      relations: ['route']
    });

    if (!collectionPoint) {
      throw new NotFoundException(
        `Collection Point with route_id ${route_id} and sequence ${sequence} not found`,
      );
    }

    await this.collectionPointsRepository.remove(collectionPoint);
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
  


    async removeAllByRouteId(routeId: string): Promise<{ affected: number }> {
      const route = await this.routeRepository.findOne({
        where: { route_id: routeId }
      });
      
      if (!route) {
        throw new NotFoundException(`Route with ID ${routeId} not found`);
      }
    
      const result = await this.collectionPointsRepository
        .createQueryBuilder()
        .delete()
        .from(CollectionPoints)
        .where('route.route_id = :routeId', { routeId })
        .execute();
      
      return { affected: result.affected ?? 0 };
    }
}