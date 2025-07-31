import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ExamSubmissionsService } from './exam-submissions.service';
import { CreateExamSubmissionDto } from './dto/create-exam-submission.dto';
import { UpdateExamSubmissionDto } from './dto/update-exam-submission.dto';
import { ApiTags } from '@nestjs/swagger';
import { ParseObjectIdPipe } from '@/core/parse-id.pipe';
import { Types } from 'mongoose';
import { UserId } from '@/decorator/user-id.decorator';

@ApiTags('Exam Submissions')
@Controller('exams/:examId/exam-submit')
export class ExamSubmissionsController {
  constructor(
    private readonly examSubmissionsService: ExamSubmissionsService,
  ) {}

  @Post()
  async createAndGrade(
    @Param('examId', ParseObjectIdPipe) examId: Types.ObjectId,
    @Body() CreateExamSubmissionDto: CreateExamSubmissionDto,
    @UserId() userId: Types.ObjectId,
  ) {
    CreateExamSubmissionDto.examId = examId;
    CreateExamSubmissionDto.studentId = userId;
    const result =
      await this.examSubmissionsService.createAndGrade(CreateExamSubmissionDto);
    return {
      message: 'Submission created and graded successfully',
      totalScore: result.totalScore,
      submission: result,
    };
  }

  // @Get()
  // findAll() {
  //   return this.examSubmissionsService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.examSubmissionsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateExamSubmissionDto: UpdateExamSubmissionDto,
  // ) {
  //   return this.examSubmissionsService.update(+id, updateExamSubmissionDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.examSubmissionsService.remove(+id);
  // }
}
