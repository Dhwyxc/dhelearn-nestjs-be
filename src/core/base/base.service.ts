import { Model, FilterQuery ,Document} from 'mongoose';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  filter?: FilterQuery<any>;
}


export class BaseService<T, S = T & Document> {
  constructor(private readonly model: Model<S>) {}

  async create(createDto: T){
    return this.model.create(createDto);
  }

  async findAll(filter : FilterQuery<S>,) {
    return this.model.find(filter).exec();
  }

  async findById(id: string){
    const item = await this.model.findById(id).exec();
    if (!item) throw new NotFoundException('Không tìm thấy bản ghi');
    return item;
  }
  async findOne(filter : FilterQuery<S>){
    const item = await this.model.findOne(filter).exec();
    if (!item) throw new NotFoundException('Không tìm thấy bản ghi');
    return item;
  }

  async update(id: string, updateDto: any){
    const updated = await this.model.findByIdAndUpdate(id, updateDto, {
      new: true,
    }).exec();

    if (!updated) throw new NotFoundException('Không tìm thấy bản ghi');
    return updated;
  }

  async delete(id: string){
    const deleted = await this.model.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Không tìm thấy bản ghi');
    return deleted;
  }

async paginate(options: PaginationOptions): Promise<{
  data: T[];
  total: number;
  page: number;
  limit: number;
}> {
  const {
    page = 1,
    limit = 10,
    sort = { createdAt: -1 },
    filter = {},
  } = options;

  const skip = (page - 1) * limit;

  const result = await this.model.aggregate([
    { $match: filter },
    {
      $facet: {
        data: [
          // { $sort: sort },
          { $skip: skip },
          { $limit: limit },
        ],
        total: [
          { $count: 'count' },
        ],
      },
    },
    {
      $project: {
        data: 1,
        total: { $arrayElemAt: ['$total.count', 0] },
      },
    },
  ]).exec();

  const { data, total } = result[0] || { data: [], total: 0 };

  return {
    data,
    total: total || 0,
    page,
    limit,
  };
}

}
