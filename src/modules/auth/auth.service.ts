import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/lib/db/entities/user.entity';
import { Doctor } from 'src/lib/db/entities/doctor.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return { ...result, role: 'user' };
    }
    return null;
  }

  async validateDoctor(email: string, password: string): Promise<any> {
    const doctor = await this.doctorRepository.findOne({ where: { email } });
    if (doctor && (await bcrypt.compare(password, doctor.password))) {
      const { password, ...result } = doctor;
      return { ...result, role: 'doctor' };
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.userId || user.doctorId,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
