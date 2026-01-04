// Prisma-based DeviceLocation entity
import { DeviceLocation as PrismaDeviceLocation, Prisma } from '@prisma/client';

export type DeviceLocation = PrismaDeviceLocation;

export type CreateDeviceLocationInput = Prisma.DeviceLocationCreateInput;
export type UpdateDeviceLocationInput = Prisma.DeviceLocationUpdateInput;

export type DeviceLocationWithRelations = Prisma.DeviceLocationGetPayload<{
  include: {
    device: true;
    session: true;
  };
}>;
