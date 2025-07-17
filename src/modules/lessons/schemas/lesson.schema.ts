import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LessonDocument = Lesson & Document;

@Schema({ timestamps: true })
export class Lesson {
  @Prop({ required: true })
  title: string;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;

  @Prop()
  content?: {
    text?: string;
    videoUrl?: string;
    images?: string[];
    pdfUrl?: string;
  };

  @Prop()
  estimatedTime?: number; // phút
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
