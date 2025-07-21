import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../../decorator/roles.decorator';
import { RoleGuard } from '../../guards/role.guard';
import { UserId } from '@/decorator/user-id.decorator';
import { Types } from 'mongoose';
import { ParseObjectIdPipe } from '@/core/parse-id.pipe';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles('admin', 'teacher')
  create(@Body() createUserDto: CreateUserDto, @UserId() userId: Types.ObjectId ) {
    return this.usersService.create({ ...createUserDto, createdBy: userId });
  }

  @Get()
  async findAll(
    @Query() query: string,
    @Query("current") current: string,
    @Query("pageSize") pageSize: string,
  ) {
    return this.usersService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
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
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
