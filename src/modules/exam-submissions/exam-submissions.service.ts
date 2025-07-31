import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateExamSubmissionDto } from './dto/create-exam-submission.dto';
import { UpdateExamSubmissionDto } from './dto/update-exam-submission.dto';
import { BaseService } from '@/core/base.service';
import { Answer, ExamSubmission, ExamSubmissionDocument } from './schemas/exam-submissions.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ExamsService } from '../exams/exams.service';

@Injectable()
export class ExamSubmissionsService extends BaseService<ExamSubmission> {
  constructor(
    @InjectModel(ExamSubmission.name)
    private examSubmissionModel: Model<ExamSubmissionDocument>,
    private readonly examsService: ExamsService,
  ) {
    super(examSubmissionModel);
  }

  async createAndGrade(CreateExamSubmissionDto: CreateExamSubmissionDto) {
    const { examId, studentId, answers } = CreateExamSubmissionDto;

    const existing = await this.examSubmissionModel.findOne({
      examId,
      studentId,
    });

    if (existing) {
      throw new BadRequestException('Student has already submitted this exam');
    }

    const exam = await this.examsService.findById(examId);
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const questionMap = new Map<string, any>();
    for (const question of exam.questions) {
      questionMap.set((question as any)._id.toString(), question);
    }

    const gradedAnswers: Answer[] = [];
    let totalScore = 0;

    for (const ans of answers) {
      const question = questionMap.get(ans.questionId.toString());
      if (!question) {
        throw new BadRequestException(`Question not found: ${ans.questionId}`);
      }

      const isCorrect =
        JSON.stringify(ans.answer) === JSON.stringify(question.correctAnswer);
      const score = isCorrect ? question.points : 0;

      gradedAnswers.push({
        questionId: new Types.ObjectId(ans.questionId),
        answer: ans.answer,
        score,
      });

      totalScore += score;
    }

    const submission = new this.examSubmissionModel({
      examId: new Types.ObjectId(examId),
      studentId: new Types.ObjectId(studentId),
      answers: gradedAnswers,
      totalScore,
    });

    return await submission.save();
  }
}
