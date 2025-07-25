import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ParseObjectIdPipe } from '@/core/parse-id.pipe';
import { Types } from 'mongoose';
import { RoleGuard } from '@/guards/role.guard';
import { Roles } from '@/decorator/roles.decorator';
import { ApiTags } from '@nestjs/swagger';

//Need more updates on what permissions the teacher creating the course should be allowed to do
@ApiTags('Lessons')
@Controller('courses/:courseId/lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @UseGuards(RoleGuard)
  @Roles('admin', 'teacher')
  @Post()
  create(
    @Param('courseId', ParseObjectIdPipe) courseId: Types.ObjectId,
    @Body() createLessonDto: CreateLessonDto,
  ) {
    return this.lessonsService.create({
      ...createLessonDto,
      courseId: courseId,
    });
  }

  @Get()
  findAll(
    @Param('courseId', ParseObjectIdPipe) courseId: Types.ObjectId,
    @Req() req: any,
  ) {
    return this.lessonsService.findAllLessonsInCourse(courseId, req.user);
  }

  @Get(':id')
  findOne(
    @Param('courseId', ParseObjectIdPipe) courseId: Types.ObjectId,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
  ) {
    return this.lessonsService.findOne({ _id: id, courseId: courseId });
  }

  @UseGuards(RoleGuard)
  @Roles('admin', 'teacher')
  @Patch(':id')
  update(
    @Param('courseId', ParseObjectIdPipe) courseId: Types.ObjectId,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return this.lessonsService.updateInCourse(courseId, id, updateLessonDto);
  }

  @UseGuards(RoleGuard)
  @Roles('admin', 'teacher')
  @Delete(':id')
  remove(
    @Param('courseId', ParseObjectIdPipe) courseId: Types.ObjectId,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
  ) {
    return this.lessonsService.deleteInCourse(courseId, id);
  }
}
