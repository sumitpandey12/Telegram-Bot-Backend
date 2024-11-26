import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Admin } from './schema/admin.schema';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.schema';
import { UpdateUserDto } from 'src/user/dto/updateUserDto.dto';
import { JwtGuard } from 'src/auth/guards/jwt-auth.guard';
import { TokenService } from 'src/token/token.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  @Get()
  getTelegramApi(): string {
    return this.tokenService.getToken();
  }

  @Put()
  updateTelegramApi(@Body('apiKey') apiKey: string): string {
    return this.tokenService.setToken(apiKey);
  }

  @Get('user')
  getAllUsers(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Put('user')
  async update(@Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.userService.update(updateUserDto.chatId, updateUserDto);
  }
}
