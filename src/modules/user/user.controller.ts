import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(
    @Body()
    body: Partial<{
      email: string;
      password: string;
      name: string;
      gender: string;
      dob: Date;
      phone: string;
      address: string;
      role: string;
    }>,
  ) {
    if (!body.email || !body.password)
      throw new BadRequestException('Email and password required');
    const user = await this.userService.registerUser(body);
    return { message: 'User registered successfully', user };
  }

  @Get(':id')
  async getUserById(@Param('id') id: number) {
    const user = await this.userService.getUserById(id);
    return { user };
  }
}
