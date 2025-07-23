import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/lib/db/entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Post('register')
  async register(@Body() body: Partial<User>) {
    const { email, password, ...rest } = body;
    if (!email || !password)
      throw new BadRequestException('Email and password required');
    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) throw new BadRequestException('Email already registered');
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      ...rest,
    });
    await this.userRepository.save(user);
    return { message: 'User registered successfully', user };
  }
}
