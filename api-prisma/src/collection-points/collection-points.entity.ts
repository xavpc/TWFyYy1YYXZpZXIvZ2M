// Prisma-based CollectionPoints entity
import { CollectionPoints as PrismaCollectionPoints, Prisma } from '@prisma/client';

export type CollectionPoints = PrismaCollectionPoints;

export type CreateCollectionPointsInput = Prisma.CollectionPointsCreateInput;
export type UpdateCollectionPointsInput = Prisma.CollectionPointsUpdateInput;

export type CollectionPointsWithRelations = Prisma.CollectionPointsGetPayload<{
  include: {
    route: true;
    collected_points: true;
  };
}>;
