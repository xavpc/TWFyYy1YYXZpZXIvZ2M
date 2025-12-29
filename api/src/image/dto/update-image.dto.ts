import { ApiProperty } from "@nestjs/swagger";
import { ImageStatus } from "../enums/device-status.enum";
import { IsEnum, IsOptional, IsString, IsUrl } from "class-validator";

export class UpdateImageDto {
    @ApiProperty({
      description: 'Status of the image',
      enum: ImageStatus,
      required: false,
      example: ImageStatus.ACTIVE
    })
    @IsEnum(ImageStatus)
    @IsOptional()
    status?: ImageStatus;
  
    @ApiProperty({
      description: 'Original filename of the image',
      required: false,
      example: 'updated-image.jpg'
    })
    @IsString()
    @IsOptional()
    file_name?: string;
  
    @ApiProperty({
      description: 'URL of the stored image',
      required: false,
      example: 'https://storage.example.com/images/updated-sample.jpg'
    })
    @IsString()
    @IsUrl()
    @IsOptional()
    image_url?: string;
  }