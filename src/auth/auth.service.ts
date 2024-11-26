import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CookieOptions, Response } from 'express';
import { GoogleUser } from './interface/auth.interface';
import {
  COOKIE_NAMES,
  expiresTimeTokenMilliseconds,
} from './constants/auth.constants';
import { Admin } from 'src/admin/schema/admin.schema';
import { AdminService } from 'src/admin/admin.service';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private adminService: AdminService,
  ) {}

  async signInWithGoogle(
    user: GoogleUser,
    res: Response,
  ): Promise<{
    encodedUser: string;
  }> {
    Logger.log('signInWithGoogle');
    if (!user) throw new BadRequestException('Unauthenticated');
    Logger.log('check existingUser');
    const existingUser = await this.findAdminByEmail(user.email);

    if (!existingUser) return this.registerGoogleAdmin(res, user);
    Logger.log('existingUser not found');
    const encodedUser = this.encodeAdminDataAsJwt(existingUser);
    Logger.log('encodedUser');
    this.setJwtTokenToCookies(res, existingUser);
    Logger.log('setJwtTokenToCookies');
    return {
      encodedUser,
    };
  }

  private async findAdminByEmail(email: string) {
    const admin = await this.adminService.findByEmail(email);
    if (!admin) return null;
    return admin;
  }

  private async registerGoogleAdmin(res: Response, user: GoogleUser) {
    try {
      const fullName =
        !user.firstName && !user.lastName
          ? user.email
          : `${user.lastName || ''} ${user.firstName || ''}`.trim();

      const newUser = await this.adminService.create(
        user.email,
        fullName,
        user.picture,
      );

      const encodedUser = this.encodeAdminDataAsJwt(newUser);

      this.setJwtTokenToCookies(res, newUser);

      return {
        encodedUser,
      };
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  private encodeAdminDataAsJwt(admin: Admin) {
    const { password, ...userData } = admin;
    return this.jwtService.sign(userData);
  }

  setJwtTokenToCookies(res: Response, user: Admin) {
    const expirationDateInMilliseconds =
      new Date().getTime() + expiresTimeTokenMilliseconds;
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      expires: new Date(expirationDateInMilliseconds),
    };

    res.cookie(
      COOKIE_NAMES.JWT,
      this.jwtService.sign({
        id: user.id,
        sub: {
          email: user.email,
        },
      }),
      cookieOptions,
    );
  }
}
