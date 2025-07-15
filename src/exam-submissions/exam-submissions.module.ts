import { Module } from '@nestjs/common';
import { ExamSubmissionsService } from './exam-submissions.service';
import { ExamSubmissionsController } from './exam-submissions.controller';

@Module({
  controllers: [ExamSubmissionsController],
  providers: [ExamSubmissionsService],
})
export class ExamSubmissionsModule {}
