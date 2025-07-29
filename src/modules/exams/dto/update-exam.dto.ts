import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsInt,
} from 'class-validator';
import { Types } from 'mongoose';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateExamDto, QuestionDto } from './create-exam.dto';

// Basic exam info update
export class UpdateExamInfoDto {
  @ApiPropertyOptional({ description: 'Title of the exam' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Course ID this exam belongs to' })
  @IsOptional()
  courseId?: Types.ObjectId;

  @ApiPropertyOptional({ description: 'Lesson ID this exam belongs to' })
  @IsOptional()
  lessonId?: Types.ObjectId;

  @ApiPropertyOptional({ description: 'Duration of the exam in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(600)
  duration?: number;

  @ApiPropertyOptional({ description: 'Whether to randomize questions' })
  @IsOptional()
  @IsBoolean()
  randomizeQuestions?: boolean;
}

// Question operations
export class AddQuestionDto extends QuestionDto {}

export class UpdateQuestionDto extends PartialType(QuestionDto) {
  @ApiPropertyOptional({ description: 'Question ID to update' })
  @IsOptional()
  @IsString()
  questionId?: string;
}

export class BulkQuestionOperationDto {
  @ApiPropertyOptional({ description: 'Questions to add', type: [AddQuestionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddQuestionDto)
  addQuestions?: AddQuestionDto[];

  @ApiPropertyOptional({ description: 'Questions to update', type: [UpdateQuestionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateQuestionDto)
  updateQuestions?: UpdateQuestionDto[];

  @ApiPropertyOptional({ description: 'Question indices to remove', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  removeQuestionIndices?: number[];

  @ApiPropertyOptional({ description: 'Reorder questions by providing new order of indices', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  reorderQuestions?: number[];
}

// Main update DTO
export class UpdateExamDto extends PartialType(CreateExamDto) {
  @ApiPropertyOptional({ description: 'Bulk question operations' })
  @IsOptional()
  @ValidateNested()
  @Type(() => BulkQuestionOperationDto)
  questionOperations?: BulkQuestionOperationDto;
}
