import { Type } from 'class-transformer';
import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateLessonDto } from './create-lesson.dto';

export class CreateMultipleLessonsDto {
  @ApiProperty({
    type: [CreateLessonDto],
    description: 'Array of lessons to create',
    example: [
      {
        title: 'Introduction to Programming',
        content: {
          text: 'Welcome to the programming course',
          videoUrl: 'https://example.com/video1.mp4',
        },
        estimatedTime: 30,
      },
      {
        title: 'Variables and Data Types',
        content: {
          text: 'Learn about variables and different data types',
          videoUrl: 'https://example.com/video2.mp4',
        },
        estimatedTime: 45,
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one lesson must be provided' })
  @ValidateNested({ each: true })
  @Type(() => CreateLessonDto)
  lessons: CreateLessonDto[];
}
