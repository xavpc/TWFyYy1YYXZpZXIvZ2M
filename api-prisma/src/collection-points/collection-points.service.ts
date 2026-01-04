import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CollectionPoints } from '@prisma/client';
import { CreateCollectionPointsDto } from './dto/create-collection-points.dto';
import { UpdateCollectionPointsDto } from './dto/update-collection-points.dto';

@Injectable()
export class CollectionPointsService {
  constructor(private prisma: PrismaService) {}

  async create(createCollectionPointsDto: CreateCollectionPointsDto): Promise<CollectionPoints> {
    if (createCollectionPointsDto.route_id) {
      const route = await this.prisma.route.findUnique({
        where: { route_id: createCollectionPointsDto.route_id }
      });

      if (!route) {
        throw new NotFoundException(
          `Route with ID ${createCollectionPointsDto.route_id} not found`
        );
      }
    }

    return this.prisma.collectionPoints.create({
      data: {
        collection_point_name: createCollectionPointsDto.collection_point_name,
        latitude: createCollectionPointsDto.latitude,
        longitude: createCollectionPointsDto.longitude,
        sequence: createCollectionPointsDto.sequence,
        route_id: createCollectionPointsDto.route_id
      }
    });
  }

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

    let routeId: string | null = null;
    if (routeIds.length === 1) {
      const route = await this.prisma.route.findUnique({
        where: { route_id: routeIds[0] }
      });

      if (!route) {
        throw new NotFoundException(`Route with ID ${routeIds[0]} not found`);
      }
      routeId = route.route_id;
    }

    // If we have a route, validate sequence ordering
    if (routeId) {
      // Get existing collection points for this route, ordered by sequence
      const existingCollectionPoints = await this.prisma.collectionPoints.findMany({
        where: { route_id: routeId },
        orderBy: { sequence: 'asc' }
      });

      const existingSequences = existingCollectionPoints.map(cp => cp.sequence);
      const newSequences = [...sequences].sort((a, b) => a - b);

      // Check for duplicate sequences with existing data
      const conflictingSequences = newSequences.filter(seq => existingSequences.includes(seq));
      if (conflictingSequences.length > 0) {
        throw new ConflictException(
          `Sequences ${conflictingSequences.join(', ')} already exist in route ${routeId}`
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
      const sortedSequences = [...sequences].sort((a, b) => a - b);
      for (let i = 0; i < sortedSequences.length; i++) {
        if (sortedSequences[i] !== i + 1) {
          throw new ConflictException(
            `Invalid sequence order. Sequences must be consecutive starting from 1. Found: ${sortedSequences.join(', ')}`
          );
        }
      }
    }

    // Create entities within transaction for atomicity
    return this.prisma.$transaction(async (tx) => {
      const savedCollectionPoints: CollectionPoints[] = [];
      for (const dto of dtos) {
        const entity = await tx.collectionPoints.create({
          data: {
            collection_point_name: dto.collection_point_name,
            latitude: dto.latitude,
            longitude: dto.longitude,
            sequence: dto.sequence,
            route_id: routeId || dto.route_id
          }
        });
        savedCollectionPoints.push(entity);
      }

      return savedCollectionPoints;
    });
  }

  findAll(): Promise<CollectionPoints[]> {
    return this.prisma.collectionPoints.findMany({
      include: { route: true }
    });
  }

  async findOne(id: string): Promise<CollectionPoints & { route: any }> {
    const collectionPoint = await this.prisma.collectionPoints.findUnique({
      where: { collection_point_id: id },
      include: { route: true }
    });
    if (!collectionPoint) {
      throw new NotFoundException(`Collection Point with ID ${id} not found`);
    }
    return collectionPoint;
  }

  async update(id: string, updateCollectionPointsDto: UpdateCollectionPointsDto): Promise<CollectionPoints> {
    await this.findOne(id);

    if (updateCollectionPointsDto.route_id) {
      const route = await this.prisma.route.findUnique({
        where: { route_id: updateCollectionPointsDto.route_id }
      });

      if (!route) {
        throw new NotFoundException(
          `Route with ID ${updateCollectionPointsDto.route_id} not found`
        );
      }
    }

    return this.prisma.collectionPoints.update({
      where: { collection_point_id: id },
      data: updateCollectionPointsDto
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const collectionPointToDelete = await tx.collectionPoints.findUnique({
        where: { collection_point_id: id },
        include: { route: true }
      });

      if (!collectionPointToDelete) {
        throw new NotFoundException(`Collection Point with ID ${id} not found`);
      }

      const routeId = collectionPointToDelete.route_id;
      const deletedSequence = collectionPointToDelete.sequence;

      await tx.collectionPoints.delete({
        where: { collection_point_id: id }
      });

      // Decrement sequence for all collection points with higher sequence in same route
      await tx.collectionPoints.updateMany({
        where: {
          route_id: routeId,
          sequence: { gt: deletedSequence }
        },
        data: {
          sequence: { decrement: 1 }
        }
      });
    });
  }

  async removeBySequence(route_id: string, sequence: number): Promise<void> {
    const collectionPoint = await this.prisma.collectionPoints.findFirst({
      where: {
        route_id,
        sequence
      }
    });

    if (!collectionPoint) {
      throw new NotFoundException(
        `Collection Point with route_id ${route_id} and sequence ${sequence} not found`,
      );
    }

    await this.prisma.collectionPoints.delete({
      where: { collection_point_id: collectionPoint.collection_point_id }
    });
  }


  findByRoute(routeId: string): Promise<CollectionPoints[]> {
    return this.prisma.collectionPoints.findMany({
      where: { route_id: routeId },
      include: { route: true }
    });
  }

  async findByName(name: string): Promise<CollectionPoints & { route: any }> {
    const collectionPoint = await this.prisma.collectionPoints.findFirst({
      where: { collection_point_name: name },
      include: { route: true }
    });
    if (!collectionPoint) {
      throw new NotFoundException(`Collection Point with name ${name} not found`);
    }
    return collectionPoint;
  }


  async removeAllByRouteId(routeId: string): Promise<{ affected: number }> {
    const route = await this.prisma.route.findUnique({
      where: { route_id: routeId }
    });

    if (!route) {
      throw new NotFoundException(`Route with ID ${routeId} not found`);
    }

    const result = await this.prisma.collectionPoints.deleteMany({
      where: { route_id: routeId }
    });

    return { affected: result.count };
  }
}
