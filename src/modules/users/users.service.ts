import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import mongoose, { Model, Types } from 'mongoose';
import { comparePasswordHelper, hashPasswordHelper } from '@/helpers/util';
import { ChangePasswordAuthDto, CreateAuthDto } from '@/auth/dto/create-auth.dto';
import { BaseService, PaginationOptions } from '@/core/base.service';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>
  ) {
    super(userModel);
  }

  async paginate(options: PaginationOptions) {
    return super.paginate(options);
  }  

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

    user.password = undefined; // Remove password from response
    
    return user;
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  async findById(id: string | Types.ObjectId) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('Id không đúng định dạng mongodb');
    }
    return await this.userModel.findById(id).select("-password");
  }

  async update(id: string | Types.ObjectId, updateUserDto: UpdateUserDto) {
    const { name, classCode } = updateUserDto;
    return await this.userModel.findByIdAndUpdate(id, { name, classCode }, { new: true }).select("-password");
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
