import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../../decorator/roles.decorator';
import { RoleGuard } from '../../guards/role.guard';
import { UserId } from '@/decorator/user-id.decorator';
import { Types } from 'mongoose';
import { ParseObjectIdPipe } from '@/core/parse-id.pipe';
import { convertSortStringToObject } from '@/helpers/util';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles('admin', 'teacher')
  create(
    @Body() createUserDto: CreateUserDto,
    @UserId() userId: Types.ObjectId,
  ) {
    return this.usersService.create({ ...createUserDto, createdBy: userId });
  }

  @Get()
  @UseGuards(RoleGuard)
  @Roles('admin')
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('sort') sort = '-createdAt',
    @Query('q') keyword?: string,
    @Query('searchFields') searchFields?: string | string[],
  ) {
    return this.usersService.paginate({
      page: Number(page),
      limit: Number(limit),
      sort: convertSortStringToObject(sort),
      keyword,
      searchFields: searchFields ?? ['email'],
    });
  }

  @Get('manage')
  @UseGuards(RoleGuard)
  @Roles('teacher')
  findAllManage(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('sort') sort = '-createdAt',
    @UserId() userId: Types.ObjectId,
    @Query('q') keyword?: string,
    @Query('searchFields') searchFields?: string | string[],
  ) {
    return this.usersService.paginate({
      page: Number(page),
      limit: Number(limit),
      sort: convertSortStringToObject(sort),
      filter: { createdBy: userId },
      keyword,
      searchFields: searchFields ?? ['email'],
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @UseGuards(RoleGuard)
  @Roles('admin', 'teacher')
  update(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles('admin', 'teacher')
  remove(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.usersService.delete(id);
  }
}
