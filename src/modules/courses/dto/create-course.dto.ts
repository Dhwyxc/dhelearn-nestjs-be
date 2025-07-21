import { IsArray, IsIn, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { Course } from '../schemas/course.schema';

export class CreateCourseDto extends Course {}
