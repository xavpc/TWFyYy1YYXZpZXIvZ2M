// Prisma-based DeviceSession entity
import { DeviceSession as PrismaDeviceSession, Prisma } from '@prisma/client';

export type DeviceSession = PrismaDeviceSession;

export type CreateDeviceSessionInput = Prisma.DeviceSessionCreateInput;
export type UpdateDeviceSessionInput = Prisma.DeviceSessionUpdateInput;

export type DeviceSessionWithRelations = Prisma.DeviceSessionGetPayload<{
  include: {
    device_route: {
      include: {
        device: {
          include: {
            employee: true;
          };
        };
        route: true;
      };
    };
    device_locations: true;
    collected_points: true;
    reports: true;
  };
}>;
