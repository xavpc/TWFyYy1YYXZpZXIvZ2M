// Prisma-based Route entity
import { Route as PrismaRoute, Prisma } from '@prisma/client';

export type Route = PrismaRoute;

export type CreateRouteInput = Prisma.RouteCreateInput;
export type UpdateRouteInput = Prisma.RouteUpdateInput;

export type RouteWithRelations = Prisma.RouteGetPayload<{
  include: {
    route_coordinates: true;
    collection_points: true;
    images: true;
    device_routes: true;
  };
}>;
