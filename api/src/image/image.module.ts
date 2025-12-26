import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from './image.entity';
import { ImageController } from './image.controller';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { ConfigModule } from '@nestjs/config';
import { ImageService } from './image.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Image]),
    ConfigModule
  ],
  controllers: [ImageController],
  providers: [CloudinaryService, ImageService],
  exports: [CloudinaryService],
})
export class ImageModule {}