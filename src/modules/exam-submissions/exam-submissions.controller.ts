import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExamSubmissionsService } from './exam-submissions.service';
import { CreateExamSubmissionDto } from './dto/create-exam-submission.dto';
import { UpdateExamSubmissionDto } from './dto/update-exam-submission.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Exam Submissions')
@Controller('exam-submissions')
export class ExamSubmissionsController {
  constructor(private readonly examSubmissionsService: ExamSubmissionsService) {}

  @Post()
  create(@Body() createExamSubmissionDto: CreateExamSubmissionDto) {
    return this.examSubmissionsService.create(createExamSubmissionDto);
  }

  @Get()
  findAll() {
    return this.examSubmissionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.examSubmissionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExamSubmissionDto: UpdateExamSubmissionDto) {
    return this.examSubmissionsService.update(+id, updateExamSubmissionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.examSubmissionsService.remove(+id);
  }
}
