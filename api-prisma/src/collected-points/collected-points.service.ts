import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CollectedPoints } from '@prisma/client';
import { CreateCollectedPointsDto } from './dto/create-collected-points.dto';
import { UpdateCollectedPointsDto } from './dto/update-collected-points.dto';
import { DeviceLocationGateway } from 'src/sockets/device-location.gateway';
import { Prisma } from '@prisma/client';

@Injectable()
export class CollectedPointsService {
  constructor(
    private prisma: PrismaService,
    private readonly gateway: DeviceLocationGateway
  ) {}

  async create(createCollectedPointsDto: CreateCollectedPointsDto): Promise<CollectedPoints> {
    const device = await this.prisma.device.findUnique({
      where: { device_id: createCollectedPointsDto.device_id }
    });

    if (!device) {
      throw new NotFoundException(
        `Device with ID ${createCollectedPointsDto.device_id} not found`
      );
    }

    const collection_point = await this.prisma.collectionPoints.findUnique({
      where: { collection_point_id: createCollectedPointsDto.collection_point_id }
    });

    if (!collection_point) {
      throw new NotFoundException(
        `Collection Point with ID ${createCollectedPointsDto.collection_point_id} not found`
      );
    }

    const device_session = await this.prisma.deviceSession.findUnique({
      where: { session_id: createCollectedPointsDto.session_id }
    });

    if (!device_session) {
      throw new NotFoundException(
        `Device session with ID ${createCollectedPointsDto.session_id} not found`
      );
    }

    const existingEntry = await this.prisma.collectedPoints.findFirst({
      where: {
        collection_point_id: createCollectedPointsDto.collection_point_id,
        session_id: createCollectedPointsDto.session_id
      }
    });

    if (existingEntry) {
      throw new ConflictException(
        `Entry for Collection Point ${collection_point.collection_point_name} and Session ${createCollectedPointsDto.session_id} already exists.`
      );
    }

    try {
      const saved = await this.prisma.collectedPoints.create({
        data: {
          collected_timestamp: createCollectedPointsDto.collected_timestamp,
          device_id: createCollectedPointsDto.device_id,
          collection_point_id: createCollectedPointsDto.collection_point_id,
          session_id: createCollectedPointsDto.session_id
        },
        include: {
          device: true,
          collection_point: true,
          session: true
        }
      });

      this.gateway.sendCollectedUpdate({
        session_id: saved.session_id,
        collected_point_id: saved.collected_point_id,
        push_timestamp: saved.push_timestamp instanceof Date
          ? saved.push_timestamp.getTime()
          : Number(saved.push_timestamp),
        collected_timestamp: saved.collected_timestamp instanceof Date
          ? saved.collected_timestamp.toISOString()
          : String(saved.collected_timestamp),
        collection_point: saved.collection_point
      });

      return saved;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `Entry for Collection Point and Session already exists.`
          );
        }
      }
      throw error;
    }
  }

  findAll(): Promise<CollectedPoints[]> {
    return this.prisma.collectedPoints.findMany({
      include: {
        device: true,
        collection_point: true,
        session: true
      }
    });
  }


  async findOne(id: string): Promise<CollectedPoints & { device: any; collection_point: any; session: any }> {
    const collectedPoint = await this.prisma.collectedPoints.findUnique({
      where: { collected_point_id: id },
      include: {
        device: true,
        collection_point: true,
        session: true
      }
    });
    if (!collectedPoint) {
      throw new NotFoundException(`Collected Point with ID ${id} not found`);
    }
    return collectedPoint;
  }


  async update(id: string, updateCollectedPointsDto: UpdateCollectedPointsDto): Promise<CollectedPoints> {
    await this.findOne(id);

    return this.prisma.collectedPoints.update({
      where: { collected_point_id: id },
      data: updateCollectedPointsDto
    });
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.collectedPoints.delete({
        where: { collected_point_id: id }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Collected Point with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  findByDevice(deviceId: string): Promise<CollectedPoints[]> {
    return this.prisma.collectedPoints.findMany({
      where: { device_id: deviceId },
      include: {
        device: true,
        collection_point: true,
        session: true
      }
    });
  }

  findBySession(sessionId: string): Promise<CollectedPoints[]> {
    return this.prisma.collectedPoints.findMany({
      where: { session_id: sessionId },
      include: {
        device: true,
        collection_point: true,
        session: true
      }
    });
  }

  async isCollectionAlreadyCollected(
    collectionPointId: string,
    sessionId: string
  ): Promise<boolean> {
    const collectionPoint = await this.prisma.collectionPoints.findUnique({
      where: { collection_point_id: collectionPointId },
    });

    if (!collectionPoint) {
      throw new NotFoundException(`Collection Point with ID ${collectionPointId} not found.`);
    }

    const session = await this.prisma.deviceSession.findUnique({
      where: { session_id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found.`);
    }

    const collectedPoint = await this.prisma.collectedPoints.findFirst({
      where: {
        collection_point_id: collectionPointId,
        session_id: sessionId,
      },
    });

    return !!collectedPoint;
  }
}
