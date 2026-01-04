// Prisma-based DeviceRoute entity
import { DeviceRoute as PrismaDeviceRoute, DeviceRouteDay, Prisma } from '@prisma/client';

export type DeviceRoute = PrismaDeviceRoute;
export { DeviceRouteDay };

export type CreateDeviceRouteInput = Prisma.DeviceRouteCreateInput;
export type UpdateDeviceRouteInput = Prisma.DeviceRouteUpdateInput;

export type DeviceRouteWithRelations = Prisma.DeviceRouteGetPayload<{
  include: {
    device: {
      include: {
        employee: true;
      };
    };
    route: true;
    device_sessions: true;
  };
}>;
