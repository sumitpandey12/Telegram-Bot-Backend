import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @IsNumber()
  @IsNotEmpty()
  readonly chatId: number;

  @IsString()
  readonly firstName: string;

  @IsString()
  readonly lastName: string;

  @IsString()
  @IsNotEmpty()
  readonly username: string;

  @IsString()
  readonly city: string = '';

  @IsBoolean()
  readonly isBlocked: boolean = false;

  @IsDate()
  readonly createdAt: Date = new Date();

  @IsDate()
  readonly updatedAt: Date = new Date();
}
