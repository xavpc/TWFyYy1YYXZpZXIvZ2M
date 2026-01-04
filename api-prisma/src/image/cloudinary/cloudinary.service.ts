import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Image } from '@prisma/client';

@Injectable()
export class CloudinaryService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    routeId: string,
  ): Promise<Image> {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'route-images',
        resource_type: 'auto',
      });

      return this.prisma.image.create({
        data: {
          image_url: result.secure_url,
          file_name: file.originalname,
          route_id: routeId,
        },
      });
    } catch (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }
}
