// Prisma-based CollectedPoints entity
import { CollectedPoints as PrismaCollectedPoints, Prisma } from '@prisma/client';

export type CollectedPoints = PrismaCollectedPoints;

export type CreateCollectedPointsInput = Prisma.CollectedPointsCreateInput;
export type UpdateCollectedPointsInput = Prisma.CollectedPointsUpdateInput;

export type CollectedPointsWithRelations = Prisma.CollectedPointsGetPayload<{
  include: {
    collection_point: true;
    device: true;
    session: true;
  };
}>;
