import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceLocation } from './device-location.entity';
import { CreateDeviceLocationDto } from './dto/create-deviceLocation.dto';
import { UpdateDeviceLocationDto } from './dto/update-deviceLocation.dto';
import { Device } from '../device/device.entity';
import { DeviceSession } from 'src/device-session/device-session.entity';
import { DeviceLocationGateway } from 'src/sockets/device-location.gateway';

@Injectable()
export class DeviceLocationService {
  constructor(
    @InjectRepository(DeviceLocation)
    private deviceLocationRepository: Repository<DeviceLocation>,
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
    @InjectRepository(DeviceSession)
    private deviceSessionRepository: Repository<DeviceSession>,
    private readonly gateway: DeviceLocationGateway
  ) {}

  async create(createDeviceLocationDto: CreateDeviceLocationDto): Promise<DeviceLocation> {
    const deviceLocation = this.deviceLocationRepository.create(createDeviceLocationDto);
    
    if (createDeviceLocationDto.device_id) {
      const device = await this.deviceRepository.findOne({
        where: { device_id: createDeviceLocationDto.device_id }
      });
      
      if (!device) {
        throw new NotFoundException(
          `Device with ID ${createDeviceLocationDto.device_id} not found`
        );
      }
      
      deviceLocation.device = device;
    }

    if (createDeviceLocationDto.session_id) {
      const session = await this.deviceSessionRepository.findOne({
        where: { session_id: createDeviceLocationDto.session_id }
      });
      
      if (!session) {
        throw new NotFoundException(
          `session with ID ${createDeviceLocationDto.session_id} not found`
        );
      }
      
      deviceLocation.session = session;
    }

    const saved = await this.deviceLocationRepository.save(deviceLocation);

    this.gateway.sendLocationUpdate({
      session_id: saved.session?.session_id,
      latitude: String(saved.latitude),
      longitude: String(saved.longitude),
      current_location_timestamp: String(saved.current_location_timestamp),
    });

    return saved;
  }

  findAll(): Promise<DeviceLocation[]> {
    return this.deviceLocationRepository.find({
      relations: ['device', 'session']
    });
  }

  async findOne(id: string): Promise<DeviceLocation> {
    const deviceLocation = await this.deviceLocationRepository.findOne({
      where: { device_location_id: id },
      relations: ['device', 'session']
    });
    if (!deviceLocation) {
      throw new NotFoundException(`Device Location with ID ${id} not found`);
    }
    return deviceLocation;
  }

  async update(id: string, updateDeviceLocationDto: UpdateDeviceLocationDto): Promise<DeviceLocation> {
    const deviceLocation = await this.findOne(id);
    Object.assign(deviceLocation, updateDeviceLocationDto);
    return this.deviceLocationRepository.save(deviceLocation);
  }

  async remove(id: string): Promise<void> {
    const result = await this.deviceLocationRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Device Location with ID ${id} not found`);
    }
  }

  findByDevice(deviceId: string): Promise<DeviceLocation[]> {
    return this.deviceLocationRepository.find({
      where: { device: { device_id: deviceId } },
      relations: ['device', 'session']
    });
  }

  findBySession(sessionId: string): Promise<DeviceLocation[]> {
    return this.deviceLocationRepository.find({
      where: { session: { session_id: sessionId } },
      relations: ['device', 'session']
    });
  }

  async createBatch(createDeviceLocationDtos: CreateDeviceLocationDto[]): Promise<DeviceLocation[]> {
    const createdLocations: DeviceLocation[] = [];
    
    for (const dto of createDeviceLocationDtos) {
      const deviceLocation = this.deviceLocationRepository.create(dto);
      
      if (dto.device_id) {
        const device = await this.deviceRepository.findOne({
          where: { device_id: dto.device_id }
        });
        
        if (!device) {
          throw new NotFoundException(
            `Device with ID ${dto.device_id} not found`
          );
        }
        
        deviceLocation.device = device;
      }
  
      if (dto.session_id) {
        const session = await this.deviceSessionRepository.findOne({
          where: { session_id: dto.session_id }
        });
        
        if (!session) {
          throw new NotFoundException(
            `Session with ID ${dto.session_id} not found`
          );
        }
        
        deviceLocation.session = session;
      }
      
      const savedLocation = await this.deviceLocationRepository.save(deviceLocation);
      createdLocations.push(savedLocation);
    }
    
    return createdLocations;
  }
  
}