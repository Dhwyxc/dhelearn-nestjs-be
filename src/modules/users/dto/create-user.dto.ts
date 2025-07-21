import { IsString, IsNotEmpty, IsEmail, IsOptional, IsIn } from 'class-validator';
import { Types } from 'mongoose';
import { User } from '../schemas/user.schema';

export class CreateUserDto extends User{}
