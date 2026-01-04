import { Module } from '@nestjs/common';
import { ImageController } from './image.controller';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { ConfigModule } from '@nestjs/config';
import { ImageService } from './image.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [ImageController],
  providers: [CloudinaryService, ImageService],
  exports: [CloudinaryService],
})
export class ImageModule {}
