import { Controller, Post, Get, UseInterceptors, UploadedFile, Param, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { ImageService } from './image.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Image } from './image.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Images (API documentation still under development)')
@Controller('images')
export class ImageController {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly imageService: ImageService,
  ) {}

  @Post('upload/:routeId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('routeId') routeId: string,
  ) {
    return this.cloudinaryService.uploadImage(file, routeId);
  }

  @Get()
  async findAll(): Promise<Image[]> {
    return this.imageService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Image> {
    return this.imageService.findOne(id);
  }

  @Get('route/:routeId')
  async findByRouteId(@Param('routeId') routeId: string) {
    const images = await this.imageService.findByRouteId(routeId);
    return {
        success: true,
        message: 'Collection points retrieved successfully',
        data: images,
        total: images.length,
      };
  }
}

//TODO: enhance get