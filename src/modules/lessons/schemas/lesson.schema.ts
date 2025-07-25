import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LessonDocument = Lesson & Document;

@Schema({ _id: false }) // _id: false disables _id for the subdocument
export class LessonContent {
  @Prop()
  text?: string;

  @Prop()
  videoUrl?: string;

  @Prop()
  imageUrl?: string;

  @Prop()
  pdfUrl?: string;
}

@Schema({ timestamps: true })
export class Lesson {
  @Prop({ required: true })
  title: string;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;

  @Prop({ type: () => LessonContent })
  content?: LessonContent;

  @Prop()
  estimatedTime?: number; // phút
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
export const LessonContentSchema = SchemaFactory.createForClass(LessonContent);
