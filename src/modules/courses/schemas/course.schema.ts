import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, SchemaTypes, Types } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop()
  imageUrl?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  studentIds: Types.ObjectId[];

  @Prop({ enum: ['private', 'public'], default: 'public' })
  tag: 'private' | 'public';
}

export const CourseSchema = SchemaFactory.createForClass(Course);
