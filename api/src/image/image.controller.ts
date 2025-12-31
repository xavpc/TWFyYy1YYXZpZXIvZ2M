import { Controller, Post, Get, UseInterceptors, UploadedFile, Param, Delete, NotFoundException, BadRequestException, Body, Put } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { ImageService } from './image.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiParam, ApiBody } from '@nestjs/swagger';
import { UploadImageDto } from './dto/upload-image.dto';
import { ImageResponseDto, ImageListResponseDto } from './dto/image-response.dto';
import { existsSync, mkdirSync } from 'fs';
import { UpdateImageDto } from './dto/update-image.dto';

@ApiTags('Images')
@Controller('mobile.images')
export class ImageController {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly imageService: ImageService,
  ) {}

  @Post('upload/:routeId')
  @ApiOperation({
      summary: 'Upload a new image for a route',
      description: `
  Upload a new image file that will be associated with a specific route.
  
  Example of expected image format:<br/>
  <a href="https://res.cloudinary.com/dzlzm64uw/image/upload/v1739186108/route-images/radnknqxcsokxk8fbq96.png" target="_blank">
    <img src="https://res.cloudinary.com/dzlzm64uw/image/upload/v1739186108/route-images/radnknqxcsokxk8fbq96.png" width="600" style="max-width: 100%;" />
  </a><br/>
  <small>(Click image to view full size)</small>
  
  Specifications:
  - Supported formats: JPG, PNG, JPEG
  - Max file size: 5MB
  - Image will be stored in Cloudinary
  `
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
      name: 'routeId',
      type: 'string',
      description: 'ID of the route to attach the image to',
      example: '80de6341-e1e1-11ef-9da2-54ee75718d0f'
  })
  @ApiBody({
      type: UploadImageDto
  })
  @UseInterceptors(
      FileInterceptor('file', {
          storage: diskStorage({
              destination: './uploads',
              filename: (req, file, callback) => {
                  if (!existsSync('./uploads')) {
                      mkdirSync('./uploads', { recursive: true });
                  }
                  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                  callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
              },
          }),
      })
  )
  async uploadImage(
      @UploadedFile() file: Express.Multer.File,
      @Param('routeId') routeId: string,
  ) {
      if (!file) {
          throw new BadRequestException('No file uploaded');
      }
      return this.cloudinaryService.uploadImage(file, routeId);
  }


  
  @Get()
  @ApiOperation({ summary: 'Get all images' })
  @ApiResponse({ status: 200, type: ImageListResponseDto })
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
  @ApiOperation({ summary: 'Get image by ID' })
  @ApiParam({ name: 'id', description: 'Image ID' })
  @ApiResponse({ status: 200, type: ImageResponseDto })
  @ApiResponse({ status: 404, description: 'Image not found' })
  async findOne(@Param('id') id: string) {
    const image = await this.imageService.findOne(id);
    return {
      success: true,
      message: 'Image retrieved successfully',
      data: image,
    };
  }

  @Get('route/:routeId')
  @ApiOperation({ summary: 'Get all images for a specific route' })
  @ApiParam({ name: 'routeId', description: 'Route ID' })
  @ApiResponse({ status: 200, type: ImageListResponseDto })
  async findByRouteId(@Param('routeId') routeId: string) {
    const images = await this.imageService.findByRouteId(routeId);
    return {
      success: true,
      message: 'Images retrieved successfully',
      data: images,
      total: images.length,
    };
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update an image',
    description: 'Update image details including status, filename, and image URL'
  })
  @ApiParam({
    name: 'id',
    description: 'Image ID to update',
    example: '80de6341-e1e1-11ef-9da2-54ee75718d0f'
  })
  @ApiBody({ type: UpdateImageDto })
  @ApiResponse({
    status: 200,
    description: 'Image updated successfully',
    type: ImageResponseDto
  })
  @ApiResponse({ status: 404, description: 'Image not found' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async update(
    @Param('id') id: string,
    @Body() updateImageDto: UpdateImageDto
  ) {
    const updatedImage = await this.imageService.update(id, updateImageDto);
    return {
      success: true,
      message: 'Image updated successfully',
      data: updatedImage,
    };
  }
}