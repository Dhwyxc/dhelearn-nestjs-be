import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type ExamDocument = Exam & Document;

@Schema({})
export class Question {
  @Prop({ required: true })
  questionText: string;

  @Prop({ required: true, enum: ['mcq', 'essay', 'short-answer'] })
  type: 'mcq' | 'essay' | 'short-answer';

  @Prop()
  image?: string;

  @Prop([String])
  choices?: string[]; // Chỉ có nếu type === 'mcq'

  @Prop({ type: MongooseSchema.Types.Mixed })
  correctAnswer?: string | string[]; // Chuỗi hoặc danh sách đáp án

  @Prop({ required: true })
  points: number;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

@Schema({ timestamps: true })
export class Exam {
  @Prop({ required: true })
  title: string;

  @Prop({ type: Types.ObjectId, ref: 'Course' })
  courseId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Lesson' })
  lessonId?: Types.ObjectId;

  @Prop()
  duration: number; // phút

  @Prop({ default: false })
  randomizeQuestions?: boolean;

  @Prop({ type: [QuestionSchema], default: [] })
  questions: Question[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;
}

export const ExamSchema = SchemaFactory.createForClass(Exam);
