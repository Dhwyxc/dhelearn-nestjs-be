import { PartialType } from "@nestjs/mapped-types";
import { IsMongoId, IsNotEmpty, IsOptional } from "class-validator";
import { CreateUserDto } from "./create-user.dto";


export class UpdateUserDto extends PartialType(CreateUserDto){
}
