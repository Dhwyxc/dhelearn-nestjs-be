import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLessonContentDto {
  @ApiProperty({ required: false, description: 'Text content of the lesson' })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiProperty({ required: false, description: 'Video URL for the lesson' })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiProperty({ required: false, description: 'Image URL for the lesson' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ required: false, description: 'PDF URL for the lesson' })
  @IsOptional()
  @IsString()
  pdfUrl?: string;
}

export class CreateLessonDto {
  @ApiProperty({ description: 'Title of the lesson' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    required: false,
    description: 'Content of the lesson',
    type: CreateLessonContentDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateLessonContentDto)
  content?: CreateLessonContentDto;

  @ApiProperty({
    required: false,
    description: 'Estimated time to complete the lesson in minutes',
  })
  @IsOptional()
  @IsNumber()
  estimatedTime?: number;
}
