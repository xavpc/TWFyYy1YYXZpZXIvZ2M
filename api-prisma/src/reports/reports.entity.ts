// Prisma-based Reports entity
import { Reports as PrismaReports, Prisma } from '@prisma/client';

export type Reports = PrismaReports;

export type CreateReportsInput = Prisma.ReportsCreateInput;
export type UpdateReportsInput = Prisma.ReportsUpdateInput;

export type ReportsWithRelations = Prisma.ReportsGetPayload<{
  include: {
    session: {
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
      };
    };
  };
}>;
