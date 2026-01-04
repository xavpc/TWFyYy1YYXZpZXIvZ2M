// Prisma-based Users entity
import { Users as PrismaUsers, UserRole, UserStatus, Prisma } from '@prisma/client';

export type Users = PrismaUsers;
export { UserRole, UserStatus };

export type CreateUserInput = Prisma.UsersCreateInput;
export type UpdateUserInput = Prisma.UsersUpdateInput;

export type UsersWithRelations = Prisma.UsersGetPayload<{
  include: {
    employee: true;
  };
}>;
