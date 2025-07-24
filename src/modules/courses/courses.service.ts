import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course, CourseDocument } from './schemas/course.schema';
import { BaseService, PaginationOptions } from '@/core/base.service';

@Injectable()
export class CoursesService extends BaseService<Course> {
  constructor(
    @InjectModel(Course.name)
    private courseModel: Model<CourseDocument>,
  ) {
    super(courseModel);
  }

  async paginate(options: PaginationOptions) {
    return super.paginate(options);
  }

  async findCourseById(id: Types.ObjectId, user: any) {
    const course = await this.courseModel.findById(id);

    if (!course) throw new NotFoundException('Course not found');

    // Nếu là student, kiểm tra quyền truy cập
    if (user.role === 'student' && !course.studentIds.includes(user._id)) {
      throw new ForbiddenException('Bạn không được phép truy cập khóa học này');
    }

    return course;
  }

  async update(id: Types.ObjectId, updateCourseDto: UpdateCourseDto) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('Id không đúng định dạng mongodb');
    }

    const course = await this.courseModel.findById(id);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const { action, studentIds } = updateCourseDto;

    let updateQuery: any = {};

    // Nếu có studentIds + action -> chỉ update studentIds
    if (
      studentIds &&
      Array.isArray(studentIds) &&
      studentIds.length > 0 &&
      action
    ) {
      if (action === 'add') {
        updateQuery = {
          $addToSet: {
            studentIds: { $each: studentIds },
          },
        };
      } else if (action === 'remove') {
        updateQuery = {
          $pull: {
            studentIds: { $in: studentIds },
          },
        };
      } else {
        throw new BadRequestException(
          'Hành động không hợp lệ. Chỉ chấp nhận "add" hoặc "remove".',
        );
      }
    } else {
      // Nếu không có studentIds hoặc action -> update các trường còn lại
      const { action: _a, studentIds: _s, ...otherFields } = updateCourseDto;

      if (Object.keys(otherFields).length === 0) {
        throw new BadRequestException('Không có dữ liệu để cập nhật');
      }

      updateQuery = { $set: otherFields };
    }

    const updated = await this.courseModel.findByIdAndUpdate(id, updateQuery, {
      new: true,
    });

    if (!updated) throw new NotFoundException('Course not found');
    return updated;
  }
}
