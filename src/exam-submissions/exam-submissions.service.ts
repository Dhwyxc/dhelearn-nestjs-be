import { Injectable } from '@nestjs/common';
import { CreateExamSubmissionDto } from './dto/create-exam-submission.dto';
import { UpdateExamSubmissionDto } from './dto/update-exam-submission.dto';

@Injectable()
export class ExamSubmissionsService {
  create(createExamSubmissionDto: CreateExamSubmissionDto) {
    return 'This action adds a new examSubmission';
  }

  findAll() {
    return `This action returns all examSubmissions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} examSubmission`;
  }

  update(id: number, updateExamSubmissionDto: UpdateExamSubmissionDto) {
    return `This action updates a #${id} examSubmission`;
  }

  remove(id: number) {
    return `This action removes a #${id} examSubmission`;
  }
}
