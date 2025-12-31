import { ApiProperty } from '@nestjs/swagger';

export class UploadImageDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Image file to upload (supported formats: JPG, PNG, JPEG)',
    example: 'route-photo.jpg'
  })
  file: Express.Multer.File;
}