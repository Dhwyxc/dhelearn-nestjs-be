import { IsString, IsNotEmpty, IsEmail, IsOptional, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsIn(['admin', 'teacher', 'student'])
  @IsNotEmpty()
  role: 'admin' | 'teacher' | 'student';

  @IsOptional()
  @IsString()
  classCode?: string;

  @IsOptional()
  @IsString()
  createdBy?: string;
}
