import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin } from './schema/admin.schema';

@Injectable()
export class AdminService {
  constructor(@InjectModel('Admin') private adminModel: Model<Admin>) {}

  async create(
    email: string,
    fullName: string,
    picture: string,
    password?: string,
  ): Promise<Admin> {
    const newAdmin = new this.adminModel({
      email,
      fullName,
      picture,
      password: password ?? '',
    });
    return newAdmin.save();
  }

  async findByEmail(email: string): Promise<Admin> {
    return this.adminModel.findOne({ email }).exec();
  }

  // async getKey(): Promise<Admin> {
  //   const admin: Admin = await this.adminModel.findOne().exec();
  //   return admin;
  // }

  // async updateKey(id: string, apiKey: string): Promise<Admin> {
  //   const admin: Admin = await this.adminModel.findByIdAndUpdate(
  //     id,
  //     { apiKey },
  //     { new: true },
  //   );
  //   this.eventEmitter.emit('apiKeyUpdated', apiKey);
  //   return admin;
  // }
}
