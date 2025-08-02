import { Transform, Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsEnum,
  Min,
  Max,
  ArrayMinSize,
} from 'class-validator';
import { Types } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QuestionDto {
  @ApiProperty({ description: 'The question text' })
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @ApiProperty({
    description: 'Type of question',
    enum: ['mcq', 'essay', 'short-answer'],
  })
  @IsEnum(['mcq', 'essay', 'short-answer'])
  type: 'mcq' | 'essay' | 'short-answer';

  @ApiPropertyOptional({ description: 'Image URL for the question' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    description: 'Choices for MCQ questions',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  choices?: string[];

  @ApiPropertyOptional({ description: 'Correct answer(s) for the question' })
  @IsOptional()
  correctAnswer?: string | string[];

  @ApiProperty({ description: 'Points for this question' })
  @IsNumber()
  points: number;
}

export class CreateExamDto {
  @ApiProperty({ description: 'Title of the exam' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Course ID this exam belongs to' })
  @IsOptional()
  @Transform(({ value }) => (value ? new Types.ObjectId(value) : undefined))
  courseId?: Types.ObjectId;

  @ApiPropertyOptional({ description: 'Lesson ID this exam belongs to' })
  @IsOptional()
  @Transform(({ value }) => (value ? new Types.ObjectId(value) : undefined))
  lessonId?: Types.ObjectId;

  @ApiProperty({ description: 'Duration of the exam in minutes' })
  @IsNumber()
  @Min(1)
  @Max(600) // Max 10 hours
  duration: number;

  @ApiPropertyOptional({
    description: 'Whether to randomize questions',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  randomizeQuestions?: boolean;

  @ApiProperty({ description: 'Array of questions', type: [QuestionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  @ArrayMinSize(1)
  questions: QuestionDto[];
}
