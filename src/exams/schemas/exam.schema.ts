import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type ExamDocument = Exam & Document;

@Schema({ timestamps: true })
export class Exam {
  @Prop({ required: true })
  title: string;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Lesson' })
  lessonId?: Types.ObjectId;

  @Prop()
  duration: number; // phút

  @Prop({ default: false })
  randomizeQuestions: boolean;

  @Prop([
    {
      _id: false,
      type: {
        questionText: String,
        type: { type: String, enum: ['mcq', 'essay'], required: true },
        image: String,
        choices: [String], // dùng với mcq
        correctAnswer: { type: MongooseSchema.Types.Mixed }, // string hoặc array
        points: Number,
      },
    },
  ])
  questions: any[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;
}

export const ExamSchema = SchemaFactory.createForClass(Exam);
