import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateAuthDto {

    @IsNotEmpty({ message: "email không được để trống" })
    @IsEmail({}, { message: "email không hợp lệ" })
    email: string;

    @IsNotEmpty({ message: "password không được để trống" })
    password: string;

    @IsString()
    @IsIn(['admin', 'teacher', 'student'])
    @IsNotEmpty()
    role: 'admin' | 'teacher' | 'student';

    @IsOptional()
    name: string;
}


export class ChangePasswordAuthDto {
    
    @IsNotEmpty({ message: "oldPassword không được để trống" })
    oldPassword: string;

    @IsNotEmpty({ message: "password không được để trống" })
    password: string;

    @IsNotEmpty({ message: "confirmPassword không được để trống" })
    confirmPassword: string;

    @IsNotEmpty({ message: "email không được để trống" })
    @IsEmail({}, { message: "email không hợp lệ" })
    email: string;

}
