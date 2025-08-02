import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { BaseService, PaginationOptions } from '@/core/base.service';
import { Exam, ExamDocument, Question } from './schemas/exam.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  UpdateExamDto,
  UpdateExamInfoDto,
  AddQuestionDto,
  UpdateQuestionDto,
  BulkQuestionOperationDto,
} from './dto/update-exam.dto';

@Injectable()
export class ExamsService extends BaseService<Exam> {
  constructor(
    @InjectModel(Exam.name)
    private examModel: Model<ExamDocument>,
  ) {
    super(examModel);
  }

  async paginate(options: PaginationOptions) {
    return super.paginate(options);
  }

  // Enhanced update method with validation
  // async update(id: Types.ObjectId, updateExamDto: UpdateExamDto) {
  //   const exam = await this.findOne(id);
  //   if (!exam) {
  //     throw new NotFoundException(`Exam with ID ${id} not found`);
  //   }

  //   // Handle question operations separately if provided
  //   if (updateExamDto.questionOperations) {
  //     await this.handleBulkQuestionOperations(id, updateExamDto.questionOperations);
  //     delete updateExamDto.questionOperations;
  //   }

  //   // Update basic exam info
  //   if (Object.keys(updateExamDto).length > 0) {
  //     return super.update(id, updateExamDto);
  //   }

  //   return this.findOne(id);
  // }

  // Update only basic exam information
  async updateExamInfo(
    id: Types.ObjectId,
    updateExamInfoDto: UpdateExamInfoDto,
  ) {
    const exam = await this.findOne(id);
    if (!exam) {
      throw new NotFoundException(`Exam with ID ${id} not found`);
    }

    return super.update(id, updateExamInfoDto);
  }

  // Add a single question
  async addQuestion(id: Types.ObjectId, questionDto: AddQuestionDto) {
    const exam = await this.findOne(id);
    if (!exam) {
      throw new NotFoundException(`Exam with ID ${id} not found`);
    }

    this.validateQuestion(questionDto);

    return this.examModel.findByIdAndUpdate(
      id,
      { $push: { questions: questionDto } },
      { new: true },
    );
  }

  // Update a specific question by index
  async updateQuestion(
    id: Types.ObjectId,
    questionIndex: number,
    questionDto: UpdateQuestionDto,
  ) {
    const exam = await this.findOne(id);
    if (!exam) {
      throw new NotFoundException(`Exam with ID ${id} not found`);
    }

    if (questionIndex < 0 || questionIndex >= exam.questions.length) {
      throw new BadRequestException(
        `Question index ${questionIndex} is out of range`,
      );
    }

    if (questionDto.type || questionDto.questionText || questionDto.points) {
      this.validateQuestion({
        ...exam.questions[questionIndex],
        ...questionDto,
      } as Question);
    }

    const updateFields: any = {};
    Object.keys(questionDto).forEach((key) => {
      if (key !== 'questionId') {
        updateFields[`questions.${questionIndex}.${key}`] = questionDto[key];
      }
    });

    return this.examModel.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true },
    );
  }

  // Remove a question by index
  async removeQuestion(id: Types.ObjectId, questionIndex: number) {
    const exam = await this.findOne(id);
    if (!exam) {
      throw new NotFoundException(`Exam with ID ${id} not found`);
    }

    if (questionIndex < 0 || questionIndex >= exam.questions.length) {
      throw new BadRequestException(
        `Question index ${questionIndex} is out of range`,
      );
    }

    if (exam.questions.length <= 1) {
      throw new BadRequestException(
        'Cannot remove the last question. Exam must have at least one question.',
      );
    }

    exam.questions.splice(questionIndex, 1);
    return this.examModel.findByIdAndUpdate(
      id,
      { questions: exam.questions },
      { new: true },
    );
  }

  // Reorder questions
  async reorderQuestions(id: Types.ObjectId, newOrder: number[]) {
    const exam = await this.findOne(id);
    if (!exam) {
      throw new NotFoundException(`Exam with ID ${id} not found`);
    }

    if (newOrder.length !== exam.questions.length) {
      throw new BadRequestException(
        'New order array must contain all question indices',
      );
    }

    const uniqueIndices = new Set(newOrder);
    if (uniqueIndices.size !== newOrder.length) {
      throw new BadRequestException('Duplicate indices in new order array');
    }

    const maxIndex = Math.max(...newOrder);
    const minIndex = Math.min(...newOrder);
    if (maxIndex >= exam.questions.length || minIndex < 0) {
      throw new BadRequestException(
        'Invalid question index in new order array',
      );
    }

    const reorderedQuestions = newOrder.map((index) => exam.questions[index]);

    return this.examModel.findByIdAndUpdate(
      id,
      { questions: reorderedQuestions },
      { new: true },
    );
  }

  // Handle bulk question operations
  // async handleBulkQuestionOperations(id: Types.ObjectId, operations: BulkQuestionOperationDto) {
  //   const exam = await this.findOne(id);
  //   if (!exam) {
  //     throw new NotFoundException(`Exam with ID ${id} not found`);
  //   }

  //   let questions = [...exam.questions];

  //   // Remove questions (process in reverse order to maintain indices)
  //   if (operations.removeQuestionIndices && operations.removeQuestionIndices.length > 0) {
  //     const sortedIndices = operations.removeQuestionIndices.sort((a, b) => b - a);

  //     // Validate indices
  //     for (const index of sortedIndices) {
  //       if (index < 0 || index >= questions.length) {
  //         throw new BadRequestException(`Question index ${index} is out of range`);
  //       }
  //     }

  //     if (questions.length - operations.removeQuestionIndices.length < 1) {
  //       throw new BadRequestException('Cannot remove all questions. Exam must have at least one question.');
  //     }

  //     sortedIndices.forEach(index => {
  //       questions.splice(index, 1);
  //     });
  //   }

  //   // Update existing questions
  //   if (operations.updateQuestions && operations.updateQuestions.length > 0) {
  //     for (const updateQuestion of operations.updateQuestions) {
  //       const questionIndex = parseInt(updateQuestion.questionId || '0');

  //       if (questionIndex < 0 || questionIndex >= questions.length) {
  //         throw new BadRequestException(`Question index ${questionIndex} is out of range`);
  //       }

  //       const updatedQuestion = { ...questions[questionIndex], ...updateQuestion };
  //       delete updatedQuestion.questionId;
  //       this.validateQuestion(updatedQuestion as Question);
  //       questions[questionIndex] = updatedQuestion as Question;
  //     }
  //   }

  //   // Add new questions
  //   if (operations.addQuestions && operations.addQuestions.length > 0) {
  //     for (const newQuestion of operations.addQuestions) {
  //       this.validateQuestion(newQuestion);
  //       questions.push(newQuestion as Question);
  //     }
  //   }

  //   // Reorder questions if specified
  //   if (operations.reorderQuestions && operations.reorderQuestions.length > 0) {
  //     if (operations.reorderQuestions.length !== questions.length) {
  //       throw new BadRequestException('Reorder array must contain all question indices');
  //     }

  //     const uniqueIndices = new Set(operations.reorderQuestions);
  //     if (uniqueIndices.size !== operations.reorderQuestions.length) {
  //       throw new BadRequestException('Duplicate indices in reorder array');
  //     }

  //     const maxIndex = Math.max(...operations.reorderQuestions);
  //     const minIndex = Math.min(...operations.reorderQuestions);
  //     if (maxIndex >= questions.length || minIndex < 0) {
  //       throw new BadRequestException('Invalid question index in reorder array');
  //     }

  //     questions = operations.reorderQuestions.map(index => questions[index]);
  //   }

  //   return this.examModel.findByIdAndUpdate(
  //     id,
  //     { questions },
  //     { new: true }
  //   );
  // }

  // Validate question data
  private validateQuestion(question: Question | AddQuestionDto) {
    if (question.type === 'mcq') {
      if (!question.choices || question.choices.length < 2) {
        throw new BadRequestException(
          'MCQ questions must have at least 2 choices',
        );
      }
      if (!question.correctAnswer) {
        throw new BadRequestException(
          'MCQ questions must have a correct answer',
        );
      }
    }

    if (question.points <= 0) {
      throw new BadRequestException('Question points must be greater than 0');
    }
  }

  // Get exam statistics
  async getExamStatistics(id: Types.ObjectId) {
    const exam = await this.findOne(id);
    if (!exam) {
      throw new NotFoundException(`Exam with ID ${id} not found`);
    }

    const totalQuestions = exam.questions.length;
    const totalPoints = exam.questions.reduce((sum, q) => sum + q.points, 0);
    const mcqCount = exam.questions.filter((q) => q.type === 'mcq').length;
    const essayCount = exam.questions.filter((q) => q.type === 'essay').length;
    const shortAnswerCount = exam.questions.filter(
      (q) => q.type === 'short-answer',
    ).length;
    const avgPointsPerQuestion = totalPoints / totalQuestions;

    return {
      totalQuestions,
      totalPoints,
      mcqCount,
      essayCount,
      shortAnswerCount,
      avgPointsPerQuestion: Math.round(avgPointsPerQuestion * 100) / 100,
      duration: exam.duration,
      randomizeQuestions: exam.randomizeQuestions,
    };
  }
}
