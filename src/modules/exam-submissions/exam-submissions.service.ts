import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateExamSubmissionDto } from './dto/create-exam-submission.dto';
import {
  UpdateAnswerDto,
  UpdateExamSubmissionDto,
} from './dto/update-exam-submission.dto';
import { BaseService, PaginationOptions } from '@/core/base.service';
import {
  Answer,
  ExamSubmission,
  ExamSubmissionDocument,
} from './schemas/exam-submissions.schema';
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

  async paginate(options: PaginationOptions) {
    return super.paginate(options);
  }

  async submitAndGrade(dto: CreateExamSubmissionDto) {
    const { examId, studentId, answers } = dto;

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

  async submitExam(dto: CreateExamSubmissionDto) {
    const { examId, studentId, answers } = dto;

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

    const plainAnswers: Answer[] = answers.map((ans) => ({
      questionId: new Types.ObjectId(ans.questionId),
      answer: ans.answer,
      score: null, // Not graded yet
    }));

    const submission = new this.examSubmissionModel({
      examId: new Types.ObjectId(examId),
      studentId: new Types.ObjectId(studentId),
      answers: plainAnswers,
      totalScore: null, // Not graded yet
    });

    return await submission.save();
  }

  async gradeSubmission(id: Types.ObjectId, userId: Types.ObjectId) {
    const submission = await this.examSubmissionModel.findById(id);
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    const exam = await this.examsService.findById(submission.examId);
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const questionMap = new Map<string, any>();
    for (const question of exam.questions) {
      questionMap.set((question as any)._id.toString(), question);
    }

    let totalScore = 0;
    const gradedAnswers = submission.answers.map((ans) => {
      const question = questionMap.get(ans.questionId.toString());
      if (!question) {
        throw new BadRequestException(`Question not found: ${ans.questionId}`);
      }

      // Chỉ tự động chấm câu hỏi dạng 'mcq'
      if (question.type === 'mcq') {
        const isCorrect =
          JSON.stringify(ans.answer) === JSON.stringify(question.correctAnswer);
        const score = isCorrect ? question.points : 0;
        totalScore += score;

        return {
          ...ans,
          score,
        };
      }

      // Giữ nguyên các câu không phải 'mcq', không chấm điểm
      return ans;
    });

    submission.answers = gradedAnswers;
    submission.totalScore = totalScore;
    submission.gradedBy = userId;
    return await submission.save();
  }

  async gradeManually(
    id: Types.ObjectId,
    answerId: Types.ObjectId,
    answerDto: UpdateAnswerDto,
  ) {
    const submission = await this.examSubmissionModel.findById(id);
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    const exam = await this.examsService.findById(submission.examId);
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    // Tìm câu trả lời cần chấm
    const answerIndex = submission.answers.findIndex((a) =>
      (a as any)._id.equals(answerId),
    );
    if (answerIndex === -1) {
      throw new NotFoundException('Answer not found');
    }

    // Cập nhật điểm cho câu trả lời
    submission.answers[answerIndex].score = answerDto.score;

    // Cập nhật lại tổng điểm
    const totalScore = submission.answers.reduce((sum, ans) => {
      return sum + (typeof ans.score === 'number' ? ans.score : 0);
    }, 0);

    submission.totalScore = totalScore;

    await submission.save();
    return submission;
  }
}
