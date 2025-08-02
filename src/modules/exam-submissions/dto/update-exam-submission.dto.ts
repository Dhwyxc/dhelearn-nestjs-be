import { PartialType } from '@nestjs/mapped-types';
import {
  AnswerDto,
  CreateExamSubmissionDto,
} from './create-exam-submission.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateExamSubmissionDto extends PartialType(
  CreateExamSubmissionDto,
) {}

export class UpdateAnswerDto extends PartialType(AnswerDto) {}
