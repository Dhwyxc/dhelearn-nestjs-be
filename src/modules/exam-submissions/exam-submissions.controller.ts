import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ExamSubmissionsService } from './exam-submissions.service';
import { CreateExamSubmissionDto } from './dto/create-exam-submission.dto';
import { UpdateAnswerDto, UpdateExamSubmissionDto } from './dto/update-exam-submission.dto';
import { ApiTags } from '@nestjs/swagger';
import { ParseObjectIdPipe } from '@/core/parse-id.pipe';
import { Types } from 'mongoose';
import { UserId } from '@/decorator/user-id.decorator';
import { convertSortStringToObject } from '@/helpers/util';

@ApiTags('Exam Submissions')
@Controller('exams/:examId/')
export class ExamSubmissionsController {
  constructor(
    private readonly examSubmissionsService: ExamSubmissionsService,
  ) {}

  @Post('submit-grade')
  async submitAndGrade(
    @Param('examId', ParseObjectIdPipe) examId: Types.ObjectId,
    @Body() dto: CreateExamSubmissionDto,
    @UserId() userId: Types.ObjectId,
  ) {
    dto.examId = examId;
    dto.studentId = userId;
    const result = await this.examSubmissionsService.submitAndGrade(dto);
    return {
      message: 'Submission and graded successfully',
      totalScore: result.totalScore,
      submission: result,
    };
  }

  @Patch('exam-submit/:id/grade')
  async gradeSubmission(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @UserId() userId: Types.ObjectId,
  ) {
    const result = await this.examSubmissionsService.gradeSubmission(
      id,
      userId,
    );
    return { message: 'Graded successfully', data: result };
  }

  @Patch('exam-submit/:id/answer/:answerId')
  async gradeManually(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Param('answerId', ParseObjectIdPipe) answerId: Types.ObjectId,
    @Body() updateScore: UpdateAnswerDto,
  ) {
    const result = await this.examSubmissionsService.gradeManually(
      id,
      answerId,
      updateScore,
    );
    return { message: 'Graded successfully', data: result };
  }

  @Post('submit')
  async submitExam(
    @Param('examId', ParseObjectIdPipe) examId: Types.ObjectId,
    @Body() CreateExamSubmissionDto: CreateExamSubmissionDto,
    @UserId() userId: Types.ObjectId,
  ) {
    CreateExamSubmissionDto.examId = examId;
    CreateExamSubmissionDto.studentId = userId;
    const result = await this.examSubmissionsService.submitExam(
      CreateExamSubmissionDto,
    );
    return {
      message: 'Submission successfully',
      totalScore: result.totalScore,
      submission: result,
    };
  }

  @Get('exam-submit')
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('sort') sort = '-createdAt',
  ) {
    return this.examSubmissionsService.paginate({
      page: Number(page),
      limit: Number(limit),
      sort: convertSortStringToObject(sort),
    });
  }

  @Get('exam-submit/:id')
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.examSubmissionsService.findOne(id);
  }

  @Delete('exam-submit/:id')
  remove(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.examSubmissionsService.delete(id);
  }
}
