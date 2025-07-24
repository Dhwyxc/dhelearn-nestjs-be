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
  BadRequestException,
  Query,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { RoleGuard } from '../../guards/role.guard';
import { Roles } from '../../decorator/roles.decorator';
import { ParseObjectIdPipe } from '@/core/parse-id.pipe';
import { Types } from 'mongoose';
import { UserId } from '@/decorator/user-id.decorator';
import { convertSortStringToObject } from '@/helpers/util';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @UseGuards(RoleGuard)
  @Roles('admin', 'teacher')
  @Post()
  create(
    @Body() createCourseDto: CreateCourseDto,
    @UserId() userId: Types.ObjectId,
  ) {
    return this.coursesService.create({
      ...createCourseDto,
      createdBy: userId,
    });
  }

  @UseGuards(RoleGuard)
  @Roles('admin', 'teacher')
  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('sort') sort = '-createdAt',
  ) {
    return this.coursesService.paginate({
      page: Number(page),
      limit: Number(limit),
      sort: convertSortStringToObject(sort),
    });
  }

  @UseGuards(RoleGuard)
  @Roles('teacher')
  @Get('manage')
  findAllManage(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('sort') sort = '-createdAt',
    @UserId() userId: Types.ObjectId,
  ) {
    return this.coursesService.paginate({
      page: Number(page),
      limit: Number(limit),
      sort: convertSortStringToObject(sort),
      filter: { createdBy: userId },
    });
  }

  @UseGuards(RoleGuard)
  @Roles('student')
  @Get('joined')
  findAllJoin(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('sort') sort = '-createdAt',
    @UserId() userId: Types.ObjectId,
  ) {
    const filter: any = {};
    filter.studentIds = userId; // lọc theo student đã đăng ký

    return this.coursesService.paginate({
      page: Number(page),
      limit: Number(limit),
      sort: convertSortStringToObject(sort),
      filter,
    });
  }

  @Get('public')
  findAllPublic(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('sort') sort = '-createdAt',
  ) {
    return this.coursesService.paginate({
      page: Number(page),
      limit: Number(limit),
      sort: convertSortStringToObject(sort),
      filter: { tag: 'public' },
    });
  }

  @UseGuards(RoleGuard)
  @Roles('admin', 'teacher', 'student')
  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Req() req: any) {
    const user = req.user;
    return this.coursesService.findCourseById(id, user);
  }

  @UseGuards(RoleGuard)
  @Roles('admin', 'teacher')
  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Patch(':id/public')
  updateStudents(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() updateCourseDto: UpdateCourseDto,
    @UserId() userId: Types.ObjectId,
  ) {
    return this.coursesService.update(id, {
      ...updateCourseDto,
      studentIds: [userId],
    });
  }

  @UseGuards(RoleGuard)
  @Roles('admin', 'teacher')
  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.coursesService.delete(id);
  }
}
