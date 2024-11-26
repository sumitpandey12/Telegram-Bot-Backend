import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { AuthService } from './auth.service';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(GoogleOAuthGuard)
  @Get('google')
  async googleAuth(@Req() req) {}

  @UseGuards(GoogleOAuthGuard)
  @Get('google/callback')
  async googleAuthRedirect(@Req() req, @Res() res: ExpressResponse) {
    console.log(res);
    console.log('env', process.env.GOOGLE_REDIRECT_URL_CLIENT_REACT);
    const { encodedUser } = await this.authService.signInWithGoogle(
      req.user,
      res,
    );
    return res.redirect(
      `${process.env.GOOGLE_REDIRECT_URL_CLIENT_REACT}?jwtUser=${encodedUser}`,
    );
  }
}
