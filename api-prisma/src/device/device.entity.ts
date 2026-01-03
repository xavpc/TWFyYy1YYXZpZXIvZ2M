// Prisma-based Device entity
import { Device as PrismaDevice, DeviceStatus, Prisma } from '@prisma/client';

export type Device = PrismaDevice;
export { DeviceStatus };

export type CreateDeviceInput = Prisma.DeviceCreateInput;
export type UpdateDeviceInput = Prisma.DeviceUpdateInput;

export type DeviceWithRelations = Prisma.DeviceGetPayload<{
  include: {
    employee: true;
    device_locations: true;
    device_routes: true;
    collected_points: true;
    complaints: true;
  };
}>;
