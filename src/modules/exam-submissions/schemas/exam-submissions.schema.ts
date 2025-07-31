import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type ExamSubmissionDocument = ExamSubmission & Document;

@Schema({})
export class Answer {
  @Prop({ required: true })
  questionId: Types.ObjectId;

  @Prop({ required: true })
  answer: MongooseSchema.Types.Mixed;

  @Prop()
  score?: number;
}

export const AnswerSchema = SchemaFactory.createForClass(Answer);

@Schema({ timestamps: true })
export class ExamSubmission {
  @Prop({ type: Types.ObjectId, ref: 'Exam' })
  examId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  studentId: Types.ObjectId;

  @Prop({ type: [AnswerSchema], default: [] })
  answers: Answer[];

  @Prop()
  totalScore?: number;

  @Prop()
  gradedBy?: Types.ObjectId;

  @Prop()
  feedback?: string;
}

export const ExamSubmissionSchema =
  SchemaFactory.createForClass(ExamSubmission);

ExamSubmissionSchema.index({ studentId: 1, examId: 1 }, { unique: true });
