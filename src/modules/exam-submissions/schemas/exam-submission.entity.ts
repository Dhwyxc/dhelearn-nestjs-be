import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type ExamSubmissionDocument = ExamSubmission & Document;

@Schema({ timestamps: true })
export class ExamSubmission {
  @Prop({ type: Types.ObjectId, ref: 'Exam' })
  examId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  studentId: Types.ObjectId;

  @Prop([
    {
      _id: false,
      type: {
        questionId: Types.ObjectId,
        answer: MongooseSchema.Types.Mixed, // string hoặc array
        score: Number,
      },
    },
  ])
  answers: any[];

  @Prop()
  totalScore: number;

  @Prop()
  gradedBy?: Types.ObjectId;

  @Prop()
  feedback?: string;
}

export const ExamSubmissionSchema = SchemaFactory.createForClass(ExamSubmission);
