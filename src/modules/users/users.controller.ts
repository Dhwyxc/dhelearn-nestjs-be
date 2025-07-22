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

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles('admin', 'teacher')
  create(
    @Body() createUserDto: CreateUserDto, 
    @UserId() userId: Types.ObjectId 
  ) {
    return this.usersService.create({ ...createUserDto, createdBy: userId });
  }

  @Get()
  findAll(
    @Query('page') page = 1, 
    @Query('limit') limit = 10, 
    @Query('sort') sort = '-createdAt'
  ) {
    return this.usersService.paginate({
      page: Number(page),
      limit: Number(limit),
      sort: convertSortStringToObject(sort),
    });
  }

  @Get(':id')
  findOne(
    @Param('id') id: string
  ) {
    return this.usersService.findById(id);
  }

  @UseGuards(RoleGuard)
  @Roles('admin', 'teacher')
  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string
  ) {
    return this.usersService.delete(id);
  }
}
