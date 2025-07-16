import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Get,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from '../user/user.service';
import { Response } from 'express';
import { DoctorService } from '../doctor/doctor.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly doctorService: DoctorService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('complete-profile')
  @UseGuards(JwtAuthGuard)
  async completeProfile(@Request() req, @Body() body) {
    const { role, ...otherInfo } = body;
    const user = req.user;
    let result;
    if (role === 'user') {
      // Update user profile
      await this.userService.updateUserProfile(user.userId, otherInfo);
      const updatedUser = await this.userService.findByEmail(user.email);
      result = await this.authService.login({ ...updatedUser, role: 'user' });
    } else if (role === 'doctor') {
      // Create doctor profile and remove user if needed
      let doctor = await this.doctorService.findByEmail(user.email);
      if (!doctor) {
        doctor = await this.doctorService.createFromGoogle({
          email: user.email,
          name: user.name,
          ...otherInfo,
        });
      } else {
        await this.doctorService.updateDoctorProfile(
          doctor.doctorId,
          otherInfo,
        );
      }
      result = await this.authService.login({ ...doctor, role: 'doctor' });
    } else {
      throw new BadRequestException('Invalid role');
    }
    return { access_token: result.access_token, user: result.user };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates Google OAuth2 login flow
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Request() req, @Res() res: Response) {
    const { email, name } = req.user;
    let user = await this.userService.findByEmail(email);
    if (!user) {
      user = await this.userService.createFromGoogle({ email, name });
    }
    const jwt = await this.authService.login({ ...user, role: 'user' });
    return res.redirect(
      `http://localhost:3001/login/success?token=${jwt.access_token}`,
    );
  }
}
