// Prisma-based RouteCoordinates entity
import { RouteCoordinates as PrismaRouteCoordinates, Prisma } from '@prisma/client';

export type RouteCoordinates = PrismaRouteCoordinates;

export type CreateRouteCoordinatesInput = Prisma.RouteCoordinatesCreateInput;
export type UpdateRouteCoordinatesInput = Prisma.RouteCoordinatesUpdateInput;

export type RouteCoordinatesWithRelations = Prisma.RouteCoordinatesGetPayload<{
  include: {
    route: true;
  };
}>;
