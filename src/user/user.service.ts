import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { CreateUserDto } from './dto/createUserDto.dto';
import { UpdateUserDto } from './dto/updateUserDto.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findUnblockedUsers(): Promise<User[]> {
    return this.userModel
      .find({ isBlocked: false, city: { $ne: null } })
      .exec();
  }

  async findOne(chatId: number): Promise<User> {
    return this.userModel.findOne({ chatId }).exec();
  }

  async findByChatId(chatId: number): Promise<User | null> {
    try {
      return await this.userModel.findOne({ chatId }).exec();
    } catch (error) {
      console.error('Error finding user by chatId:', error);
      throw error;
    }
  }

  async update(chatId: number, updateUserDto: UpdateUserDto): Promise<User> {
    return this.userModel
      .findOneAndUpdate({ chatId }, { $set: updateUserDto }, { new: true })
      .exec();
  }
}
