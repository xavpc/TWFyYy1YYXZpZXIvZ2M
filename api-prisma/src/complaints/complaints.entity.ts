// Prisma-based Complaints entity
import { Complaints as PrismaComplaints, Prisma } from '@prisma/client';

export type Complaints = PrismaComplaints;

export type CreateComplaintsInput = Prisma.ComplaintsCreateInput;
export type UpdateComplaintsInput = Prisma.ComplaintsUpdateInput;

export type ComplaintsWithRelations = Prisma.ComplaintsGetPayload<{
  include: {
    image: true;
    device: true;
  };
}>;
