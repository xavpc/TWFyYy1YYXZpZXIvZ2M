import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeviceLocation, Prisma } from '@prisma/client';
import { CreateDeviceLocationDto } from './dto/create-deviceLocation.dto';
import { UpdateDeviceLocationDto } from './dto/update-deviceLocation.dto';
import { DeviceLocationGateway } from 'src/sockets/device-location.gateway';
import { LocationObjectType } from 'src/sockets/types/location-data.type';

@Injectable()
export class DeviceLocationService {
  constructor(
    private prisma: PrismaService,
    private readonly gateway: DeviceLocationGateway
  ) { }

  async create(createDeviceLocationDto: CreateDeviceLocationDto): Promise<DeviceLocation> {
    if (createDeviceLocationDto.device_id) {
      const device = await this.prisma.device.findUnique({
        where: { device_id: createDeviceLocationDto.device_id }
      });

      if (!device) {
        throw new NotFoundException(
          `Device with ID ${createDeviceLocationDto.device_id} not found`
        );
      }
    }

    if (createDeviceLocationDto.session_id) {
      const session = await this.prisma.deviceSession.findUnique({
        where: { session_id: createDeviceLocationDto.session_id }
      });

      if (!session) {
        throw new NotFoundException(
          `session with ID ${createDeviceLocationDto.session_id} not found`
        );
      }
    }

    const saved = await this.prisma.deviceLocation.create({
      data: {
        latitude: createDeviceLocationDto.latitude,
        longitude: createDeviceLocationDto.longitude,
        current_location_timestamp: createDeviceLocationDto.current_location_timestamp,
        device_id: createDeviceLocationDto.device_id,
        session_id: createDeviceLocationDto.session_id
      },
      include: {
        device: true,
        session: true
      }
    });

    this.gateway.sendLocationUpdate({
      session_id: saved.session_id,
      latitude: String(saved.latitude),
      longitude: String(saved.longitude),
      current_location_timestamp: String(saved.current_location_timestamp),
    });

    return saved;
  }

  findAll(): Promise<DeviceLocation[]> {
    return this.prisma.deviceLocation.findMany({
      include: {
        device: true,
        session: true
      }
    });
  }

  async findOne(id: string): Promise<DeviceLocation & { device: any; session: any }> {
    const deviceLocation = await this.prisma.deviceLocation.findUnique({
      where: { device_location_id: id },
      include: {
        device: true,
        session: true
      }
    });
    if (!deviceLocation) {
      throw new NotFoundException(`Device Location with ID ${id} not found`);
    }
    return deviceLocation;
  }

  async update(id: string, updateDeviceLocationDto: UpdateDeviceLocationDto): Promise<DeviceLocation> {
    await this.findOne(id);

    return this.prisma.deviceLocation.update({
      where: { device_location_id: id },
      data: updateDeviceLocationDto
    });
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.deviceLocation.delete({
        where: { device_location_id: id }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Device Location with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  findByDevice(deviceId: string): Promise<DeviceLocation[]> {
    return this.prisma.deviceLocation.findMany({
      where: { device_id: deviceId },
      include: {
        device: true,
        session: true
      }
    });
  }

  findBySession(sessionId: string): Promise<DeviceLocation[]> {
    return this.prisma.deviceLocation.findMany({
      where: { session_id: sessionId },
      include: {
        device: true,
        session: true
      }
    });
  }

  async createBatch(createDeviceLocationDtos: CreateDeviceLocationDto[]): Promise<DeviceLocation[]> {
    // Validate all DTOs first (outside transaction)
    for (const dto of createDeviceLocationDtos) {
      if (dto.device_id) {
        const device = await this.prisma.device.findUnique({
          where: { device_id: dto.device_id }
        });

        if (!device) {
          throw new NotFoundException(
            `Device with ID ${dto.device_id} not found`
          );
        }
      }

      if (dto.session_id) {
        const session = await this.prisma.deviceSession.findUnique({
          where: { session_id: dto.session_id }
        });

        if (!session) {
          throw new NotFoundException(
            `Session with ID ${dto.session_id} not found`
          );
        }
      }
    }

    // Create all locations within transaction for atomicity
    const createdLocations = await this.prisma.$transaction(async (tx) => {
      const locations: DeviceLocation[] = [];

      for (const dto of createDeviceLocationDtos) {
        const savedLocation = await tx.deviceLocation.create({
          data: {
            latitude: dto.latitude,
            longitude: dto.longitude,
            current_location_timestamp: dto.current_location_timestamp,
            device_id: dto.device_id,
            session_id: dto.session_id
          },
          include: {
            device: true,
            session: true
          }
        });

        locations.push(savedLocation);
      }

      return locations;
    });

    // Send socket notification only after successful transaction
    const batchSocketLocations: LocationObjectType[] = createdLocations.map(loc => ({
      session_id: loc.session_id,
      latitude: String(loc.latitude),
      longitude: String(loc.longitude),
      current_location_timestamp: String(loc.current_location_timestamp)
    }));

    this.gateway.sendBatchLocationUpdate(batchSocketLocations);

    return createdLocations;
  }
}
