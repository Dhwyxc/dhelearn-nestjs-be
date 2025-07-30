import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import {
  UpdateExamDto,
  UpdateExamInfoDto,
  AddQuestionDto,
  UpdateQuestionDto,
  BulkQuestionOperationDto,
} from './dto/update-exam.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { ParseObjectIdPipe } from '@/core/parse-id.pipe';
import { UserId } from '@/decorator/user-id.decorator';
import { convertSortStringToObject } from '@/helpers/util';

@ApiTags('Exams')
@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new exam' })
  create(
    @UserId() userId: Types.ObjectId,
    @Body() createExamDto: CreateExamDto,
  ) {
    return this.examsService.create({ ...createExamDto, createdBy: userId });
  }

  @Get()
  @ApiOperation({ summary: 'Get all exams with pagination' })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('sort') sort = '-createdAt',
    @Query('q') keyword?: string,
    @Query('searchFields') searchFields?: string | string[],
  ) {
    return this.examsService.paginate({
      page: Number(page),
      limit: Number(limit),
      sort: convertSortStringToObject(sort),
      keyword,
      searchFields: searchFields ?? ['title'],
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get exam by ID' })
  @ApiParam({ name: 'id', description: 'Exam ID' })
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.examsService.findOne(id);
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: 'Get exam statistics' })
  @ApiParam({ name: 'id', description: 'Exam ID' })
  getStatistics(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.examsService.getExamStatistics(id);
  }

  // UPDATE
  // @Patch(':id')
  // @ApiOperation({
  //   summary: 'Update exam (comprehensive update with question operations)',
  // })
  // @ApiParam({ name: 'id', description: 'Exam ID' })
  // update(
  //   @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
  //   @Body() updateExamDto: UpdateExamDto,
  // ) {
  //   return this.examsService.update(id, updateExamDto);
  // }

  // BASIC EXAM INFO UPDATES
  @Patch(':id/info')
  @ApiOperation({
    summary: 'Update only basic exam information (title, duration, etc.)',
  })
  @ApiParam({ name: 'id', description: 'Exam ID' })
  updateExamInfo(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() updateExamInfoDto: UpdateExamInfoDto,
  ) {
    return this.examsService.updateExamInfo(id, updateExamInfoDto);
  }

  // INDIVIDUAL QUESTION OPERATIONS

  @Post(':id/questions')
  @ApiOperation({ summary: 'Add a new question to exam' })
  @ApiParam({ name: 'id', description: 'Exam ID' })
  @ApiResponse({ status: 201, description: 'Question added successfully' })
  addQuestion(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() questionDto: AddQuestionDto,
  ) {
    return this.examsService.addQuestion(id, questionDto);
  }

  @Patch(':id/questions/:questionIndex')
  @ApiOperation({ summary: 'Update a specific question by index' })
  @ApiParam({ name: 'id', description: 'Exam ID' })
  @ApiParam({ name: 'questionIndex', description: 'Question index (0-based)' })
  updateQuestion(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Param('questionIndex') questionIndex: string,
    @Body() questionDto: UpdateQuestionDto,
  ) {
    return this.examsService.updateQuestion(
      id,
      parseInt(questionIndex),
      questionDto,
    );
  }

  @Delete(':id/questions/:questionIndex')
  @ApiOperation({ summary: 'Remove a question by index' })
  @ApiParam({ name: 'id', description: 'Exam ID' })
  @ApiParam({ name: 'questionIndex', description: 'Question index (0-based)' })
  @HttpCode(HttpStatus.OK)
  removeQuestion(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Param('questionIndex') questionIndex: string,
  ) {
    return this.examsService.removeQuestion(id, parseInt(questionIndex));
  }

  @Put(':id/questions/reorder')
  @ApiOperation({ summary: 'Reorder exam questions' })
  @ApiParam({ name: 'id', description: 'Exam ID' })
  @ApiResponse({ status: 200, description: 'Questions reordered successfully' })
  reorderQuestions(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body('newOrder') newOrder: number[],
  ) {
    return this.examsService.reorderQuestions(id, newOrder);
  }

  // BULK QUESTION OPERATIONS

  // @Put(':id/questions/bulk')
  // @ApiOperation({
  //   summary: 'Perform bulk question operations (add, update, remove, reorder)',
  //   description:
  //     'Allows multiple question operations in a single request. Operations are processed in order: remove, update, add, reorder.',
  // })
  // @ApiParam({ name: 'id', description: 'Exam ID' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Bulk operations completed successfully',
  // })
  // bulkQuestionOperations(
  //   @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
  //   @Body() operations: BulkQuestionOperationDto,
  // ) {
  //   return this.examsService.handleBulkQuestionOperations(id, operations);
  // }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete exam' })
  @ApiParam({ name: 'id', description: 'Exam ID' })
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.examsService.delete(id);
  }
}
