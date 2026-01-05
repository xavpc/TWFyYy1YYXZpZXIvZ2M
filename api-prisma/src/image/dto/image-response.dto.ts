import { ApiProperty } from '@nestjs/swagger';
import { Image } from '@prisma/client';

export class ImageResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Operation completed successfully' })
  message: string;

  @ApiProperty()
  data: Image;
}

export class ImageListResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Images retrieved successfully' })
  message: string;

  @ApiProperty({ isArray: true })
  data: Image[];

  @ApiProperty({ example: 10 })
  total: number;
}