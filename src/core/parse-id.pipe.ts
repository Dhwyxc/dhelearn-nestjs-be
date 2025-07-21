import {
  PipeTransform,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { isValidObjectId, Types } from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform {
  transform(value: string) {
    if (!isValidObjectId(value)) {
      throw new BadRequestException(`ID không hợp lệ: ${value}`);
    }
   return new Types.ObjectId(value)
  }
}
