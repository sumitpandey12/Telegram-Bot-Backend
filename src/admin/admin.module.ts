import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Admin, AdminSchema } from './schema/admin.schema';
import { UserModule } from 'src/user/user.module';
import { TokenService } from 'src/token/token.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Admin', schema: AdminSchema }]),
    UserModule,
  ],
  providers: [AdminService, TokenService],
  controllers: [AdminController],
})
export class AdminModule {}
