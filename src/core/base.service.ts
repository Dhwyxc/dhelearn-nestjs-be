import { Model, FilterQuery, Document, Types } from 'mongoose';
import { NotFoundException } from '@nestjs/common';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
  filter?: FilterQuery<any>;
  keyword?: string;
  searchFields?: string | string[]; // các trường được phép tìm
}

export class BaseService<T, S = T & Document> {
  constructor(private readonly model: Model<S>) {}

  async create(createDto: T) {
    return this.model.create(createDto);
  }

  async findAll(filter: FilterQuery<S>) {
    return this.model.find(filter).exec();
  }

  async findById(id: Types.ObjectId) {
    const item = await this.model.findById(id).exec();
    if (!item) throw new NotFoundException('Không tìm thấy bản ghi');
    return item;
  }
  async findOne(filter: FilterQuery<S>) {
    const item = await this.model.findOne(filter).exec();
    if (!item) throw new NotFoundException('Không tìm thấy bản ghi');
    return item;
  }

  async update(id: Types.ObjectId, updateDto: any) {
    const updated = await this.model
      .findByIdAndUpdate(id, updateDto, {
        new: true,
      })
      .exec();

    if (!updated) throw new NotFoundException('Không tìm thấy bản ghi');
    return updated;
  }

  async delete(id: Types.ObjectId) {
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
      keyword,
      searchFields = [],
    } = options;

    const skip = (page - 1) * limit;

    // Truy cập schema để lấy loại dữ liệu từng field
    const schemaPaths = this.model.schema.paths;

    //Parse SearchFields
    const searchFieldsParse = Array.isArray(searchFields)
      ? searchFields
      : searchFields.split(',');

    // Tạo filter cho keyword nếu có
    const keywordFilter: FilterQuery<S> =
      keyword && searchFieldsParse.length > 0
        ? ({
            $or: searchFieldsParse.map((field) => {
              const path = schemaPaths[field];

              if (!path) return {};

              const type = path.instance;

              if (type === 'String') {
                return {
                  [field]: { $regex: keyword, $options: 'i' },
                };
              }

              if (type === 'Number' && !isNaN(Number(keyword))) {
                return {
                  [field]: { $eq: Number(keyword) },
                };
              }

              if (type === 'Date') {
                const date = new Date(keyword);
                if (!isNaN(date.getTime())) {
                  return { [field]: { $eq: date } };
                }
              }

              return {};
            }),
          } as FilterQuery<S>)
        : {};

    const finalFilter = {
      ...filter,
      ...(keywordFilter ? { $and: [filter, keywordFilter] } : {}),
    };

    const result = await this.model
      .aggregate([
        { $match: finalFilter },
        {
          $facet: {
            data: [{ $sort: sort }, { $skip: skip }, { $limit: limit }],
            total: [{ $count: 'count' }],
          },
        },
        {
          $project: {
            data: 1,
            total: { $ifNull: [{ $arrayElemAt: ['$total.count', 0] }, 0] },
          },
        },
      ])
      .exec();

    const { data, total } = result[0] || { data: [], total: 0 };

    return {
      data,
      total,
      page,
      limit,
    };
  }
}
