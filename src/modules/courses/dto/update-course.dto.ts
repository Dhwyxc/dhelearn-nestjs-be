import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseDto } from './create-course.dto';
import { IsArray, IsIn, IsOptional } from 'class-validator';
import { isValidObjectId, Types } from 'mongoose';
import { Transform } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
    
    @IsOptional()
    @IsIn(['add', 'remove'])
    action: 'add' | 'remove';

    @IsOptional()
    @IsArray()
    @Transform(({ value }) => {
        if (!Array.isArray(value)) {
            throw new BadRequestException('studentIds must be an array');
        }
        return value.map((id: string) => new Types.ObjectId(id));
    })
    studentIds?: Types.ObjectId[];
}
