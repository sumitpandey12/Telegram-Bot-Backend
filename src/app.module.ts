import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './user/user.schema';
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';
import { TelegramService } from './telegram/telegram.service';
import { ScheduleModule } from '@nestjs/schedule';
import { AdminService } from './admin/admin.service';
import { AdminController } from './admin/admin.controller';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { AdminSchema } from './admin/schema/admin.schema';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TokenService } from './token/token.service';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://Optimiz:Optimiz1@cluster0.dx1kusj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
      {
        dbName: 'weather-bot',
      },
    ),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    MongooseModule.forFeature([{ name: 'Admin', schema: AdminSchema }]),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot(),
    UserModule,
    AdminModule,
    AuthModule,
  ],
  controllers: [AppController, UserController, AdminController],
  providers: [AppService, UserService, TelegramService, AdminService, TokenService],
})
export class AppModule {}
