// Prisma-based Image entity
import { Image as PrismaImage, ImageStatus, Prisma } from '@prisma/client';

export type Image = PrismaImage;
export { ImageStatus };

export type CreateImageInput = Prisma.ImageCreateInput;
export type UpdateImageInput = Prisma.ImageUpdateInput;

export type ImageWithRelations = Prisma.ImageGetPayload<{
  include: {
    route: true;
    complaints: true;
  };
}>;
