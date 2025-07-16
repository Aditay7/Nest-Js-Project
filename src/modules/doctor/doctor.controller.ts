import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from 'src/lib/db/entities/doctor.entity';
import * as bcrypt from 'bcryptjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('doctor')
export class DoctorController {
  constructor(
    private readonly doctorService: DoctorService,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {}

  @Post('register')
  async register(@Body() body: Partial<Doctor>) {
    const { email, password, ...rest } = body;
    if (!email || !password)
      throw new BadRequestException('Email and password required');
    const existing = await this.doctorRepository.findOne({ where: { email } });
    if (existing) throw new BadRequestException('Email already registered');
    const hashedPassword = await bcrypt.hash(password, 10);
    const doctor = this.doctorRepository.create({
      email,
      password: hashedPassword,
      ...rest,
    });
    await this.doctorRepository.save(doctor);
    return { message: 'Doctor registered successfully' };
  }

  @Get()
  async getDoctors(@Query('specialization') specialization?: string) {
    return this.doctorService.findDoctorsBySpecialization(specialization);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getDoctorProfile(@Param('id') id: number) {
    return this.doctorService.getDoctorProfileWithAvailability(id);
  }
}
