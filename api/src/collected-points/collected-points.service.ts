import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CollectedPoints } from './collected-points.entity';
import { CreateCollectedPointsDto } from './dto/create-collected-points.dto';
import { UpdateCollectedPointsDto } from './dto/update-collected-points.dto';
import { Device } from '../device/device.entity';
import { CollectionPoints } from 'src/collection-points/collection-points.entity';

@Injectable()
export class CollectedPointsService {
  constructor(
    @InjectRepository(CollectedPoints)
    private collectedPointsRepository: Repository<CollectedPoints>,
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
    @InjectRepository(CollectionPoints)
    private collectionPointsRepository: Repository<CollectionPoints>,
  ) {}

  async create(createCollectedPointsDto: CreateCollectedPointsDto): Promise<CollectedPoints> {

    const device = await this.deviceRepository.findOne({
      where: { device_id: createCollectedPointsDto.device_id }
    });
    
    if (!device) {
      throw new NotFoundException(
        `Device with ID ${createCollectedPointsDto.device_id} not found`
      );
    }
  
    const collection_point = await this.collectionPointsRepository.findOne({
      where: { collection_point_id: createCollectedPointsDto.collection_point_id }
    });
    
    if (!collection_point) {
      throw new NotFoundException(
        `Collection Point with ID ${createCollectedPointsDto.collection_point_id} not found`
      );
    }

    const CollectedPoints = this.collectedPointsRepository.create({
      device: device,
      collection_point: collection_point
    });
  
    return this.collectedPointsRepository.save(CollectedPoints);
  }

  findAll(): Promise<CollectedPoints[]> {
    return this.collectedPointsRepository.find({
      relations: ['device', 'collection_point']
    });
  }

  async findOne(id: string): Promise<CollectedPoints> {
    const CollectedPoints = await this.collectedPointsRepository.findOne({
      where: { collected_point_id: id },
      relations: ['device', 'collection_point']
    });
    if (!CollectedPoints) {
      throw new NotFoundException(`Collected Point with ID ${id} not found`);
    }
    return CollectedPoints;
  }

  async update(id: string, updateCollectedPointsDto: UpdateCollectedPointsDto): Promise<CollectedPoints> {
    const CollectedPoints = await this.findOne(id);
    Object.assign(CollectedPoints, updateCollectedPointsDto);
    return this.collectedPointsRepository.save(CollectedPoints);
  }

  async remove(id: string): Promise<void> {
    const result = await this.collectedPointsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Collected Point with ID ${id} not found`);
    }
  }

  findByDevice(deviceId: string): Promise<CollectedPoints[]> {
    return this.collectedPointsRepository.find({
      where: { device: { device_id: deviceId } },
      relations: ['device', 'collection_point']
    });
  }

  findByCollectionPoint(collectionPointId: string): Promise<CollectedPoints[]> {
    return this.collectedPointsRepository.find({
      where: { collection_point: { collection_point_id: collectionPointId } },
      relations: ['route','collection_points']
    });
  }
}