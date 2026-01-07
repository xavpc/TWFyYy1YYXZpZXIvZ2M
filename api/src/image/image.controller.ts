import { Controller, Post, Get, UseInterceptors, UploadedFile, Param, Delete, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { ImageService } from './image.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Images (API documentation still under development)')
@Controller('mobile.images')
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
  async findAll() {
    const images = await this.imageService.findAll();
    return {
      success: true,
      message: 'Images retrieved successfully',
      data: images,
      total: images.length,
    };
  }


  @Get(':id')
  async findOne(@Param('id') id: string) {
    const image = await this.imageService.findOne(id);
    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }
    return {
      success: true,
      message: 'Image retrieved successfully',
      data: image,
    };
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
