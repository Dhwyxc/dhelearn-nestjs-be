import { Module } from '@nestjs/common';
import { ExamSubmissionsService } from './exam-submissions.service';
import { ExamSubmissionsController } from './exam-submissions.controller';
import {
  ExamSubmission,
  ExamSubmissionSchema,
} from './schemas/exam-submissions.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ExamsModule } from '../exams/exams.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExamSubmission.name, schema: ExamSubmissionSchema },
    ]),
    ExamsModule,
  ],
  controllers: [ExamSubmissionsController],
  providers: [ExamSubmissionsService],
})
export class ExamSubmissionsModule {}
