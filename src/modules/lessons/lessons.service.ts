import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { CreateMultipleLessonsDto } from './dto/create-multiple-lessons.dto';
import { BaseService, PaginationOptions } from '@/core/base.service';
import { Lesson, LessonDocument } from './schemas/lesson.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CoursesService } from '../courses/courses.service';

@Injectable()
export class LessonsService extends BaseService<Lesson> {
  constructor(
    @InjectModel(Lesson.name)
    private lessonModel: Model<LessonDocument>,
    private readonly coursesService: CoursesService,
  ) {
    super(lessonModel);
  }

  async paginate(options: PaginationOptions) {
    return super.paginate(options);
  }

  async createMultiple(
    courseId: Types.ObjectId,
    createMultipleLessonsDto: CreateMultipleLessonsDto,
    user: any,
  ) {
    // Verify course exists
    const course = await this.coursesService.findCourseById(courseId, user);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Prepare lessons with courseId
    const lessonsToCreate = createMultipleLessonsDto.lessons.map((lesson) => ({
      ...lesson,
      courseId: courseId,
    }));

    // Create all lessons in bulk
    return await this.lessonModel.insertMany(lessonsToCreate);
  }

  async findAllLessonsInCourse(courseId: Types.ObjectId, user: any) {
    const course = await this.coursesService.findCourseById(courseId, user);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return this.lessonModel.find({ courseId });
  }

  async updateInCourse(
    courseId: Types.ObjectId,
    id: Types.ObjectId,
    updateLessonDto: UpdateLessonDto,
  ) {
    const lesson = await this.lessonModel.findOne({
      _id: id,
      courseId: courseId,
    });
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return this.lessonModel.findOneAndUpdate(
      { _id: id, courseId: courseId },
      updateLessonDto,
      { new: true },
    );
  }

  async deleteInCourse(courseId: Types.ObjectId, id: Types.ObjectId) {
    const lesson = await this.lessonModel.findOne({
      _id: id,
      courseId: courseId,
    });
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    return this.lessonModel.findOneAndDelete({
      _id: id,
      courseId: courseId,
    });
  }
}
