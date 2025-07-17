import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { comparePasswordHelper, hashPasswordHelper } from '@/helpers/util';
import aqp from 'api-query-params';
import { ChangePasswordAuthDto, CreateAuthDto } from '@/auth/dto/create-auth.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>
  
  ) {}

  isEmailExist = async (email: string) => {
    const user = await this.userModel.exists({ email });
    if (user) return true;
    return false;
  }

  async create(createUserDto: CreateUserDto) {
    const { name, email, password, role, classCode, createdBy } = createUserDto;
    
    //check email
    const isExist = await this.isEmailExist(email);
    if (isExist === true) {
      throw new BadRequestException(`Email đã tồn tại: ${email}. Vui lòng sử dụng email khác.`)
    }

    //hash password
    const hashPassword = await hashPasswordHelper(createUserDto.password);
    
    const user = await this.userModel.create({
      name, email, password: hashPassword, role, classCode, createdBy
    })

    return {
      _id: user._id
    }

  }

async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (current - 1) * (pageSize);

    const results = await this.userModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .select("-password")
      .sort(sort as any);

    return {
      meta: {
        current: current, //trang hiện tại
        pageSize: pageSize, //số lượng bản ghi đã lấy
        pages: totalPages,  //tổng số trang với điều kiện query
        total: totalItems // tổng số phần tử (số bản ghi)
      },
      results //kết quả query
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email })
  }

  async update(updateUserDto: UpdateUserDto) {
    return await this.userModel.updateOne(
      { _id: updateUserDto._id }, { ...updateUserDto });
  }

  async remove(_id: string) {
    //check id
    if (mongoose.isValidObjectId(_id)) {
      //delete
      return this.userModel.deleteOne({ _id })
    } else {
      throw new BadRequestException("Id không đúng định dạng mongodb")
    }

  }

  async handleRegister(registerDto: CreateAuthDto) {
    const { name, email, password, role } = registerDto;

    //check email
    const isExist = await this.isEmailExist(email);
    if (isExist === true) {
      throw new BadRequestException(`Email đã tồn tại: ${email}. Vui lòng sử dụng email khác.`)
    }

    //hash password
    const hashPassword = await hashPasswordHelper(password);
    const user = await this.userModel.create({
      name, email, password: hashPassword, role
    })

    return {
      _id: user._id
    }
  }

  async changePassword({ email, oldPassword, password, confirmPassword }: ChangePasswordAuthDto) {
    if (password !== confirmPassword)
      throw new BadRequestException("Mật khẩu mới và xác nhận mật khẩu không khớp.");

    const user = await this.userModel.findOne({ email });
    if (!user)
      throw new BadRequestException("Tài khoản không tồn tại.");

    if (!(await comparePasswordHelper(oldPassword, user.password)))
      throw new BadRequestException("Mật khẩu cũ không đúng.");

    if (await comparePasswordHelper(password, user.password))
      throw new BadRequestException("Mật khẩu mới phải khác mật khẩu cũ.");

    user.password = await hashPasswordHelper(password);
    await user.save();

    return { message: "Đổi mật khẩu thành công." };
  }

}
