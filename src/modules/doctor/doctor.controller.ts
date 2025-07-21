import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  Patch,
  Delete,
} from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from 'src/lib/db/entities/doctor.entity';
import * as bcrypt from 'bcryptjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Availability } from 'src/lib/db/entities/availability.entity';
import { Slot } from 'src/lib/db/entities/slot.entity';
import { User } from 'src/lib/db/entities/user.entity';

@UseGuards()
@Controller('doctor')
export class DoctorController {
  constructor(
    private readonly doctorService: DoctorService,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('register')
  async register(
    @Request() req,
    @Body()
    body: {
      specialization: string;
      years_of_experience: string;
      profile_pic: string;
      bio: string;
    },
  ) {
    const { specialization, years_of_experience, profile_pic, bio } = body;
    const userId = req.user.userId;
    if (!userId || !specialization || !years_of_experience)
      throw new BadRequestException(
        'userId, specialization, and years_of_experience are required',
      );
    const existing = await this.doctorRepository.findOne({ where: { userId } });
    if (existing)
      throw new BadRequestException('Doctor already registered for this user');
    const doctor = this.doctorRepository.create({
      userId,
      specialization,
      years_of_experience,
      profile_pic,
      bio,
    });
    await this.doctorRepository.save(doctor);
    return { message: 'Doctor registered successfully', doctor };
  }

  @Get()
  async getDoctors(@Query('specialization') specialization?: string) {
    const doctors =
      await this.doctorService.findDoctorsBySpecialization(specialization);
    const users = await this.doctorRepository.manager.find(User, { where: {} });
    return await Promise.all(
      doctors.map(async (doctor) => {
        const user = users.find((u) => u.userId === doctor.userId);
        return {
          userId: doctor.userId,
          user,
          doctor,
        };
      }),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getDoctorProfile(@Param('id') id: number) {
    const doctor = await this.doctorService.findByUserId(id);
    if (!doctor) throw new BadRequestException('Doctor not found');
    const user = await this.doctorRepository.manager.findOne(User, {
      where: { userId: id },
    });
    return {
      userId: id,
      user,
      doctor,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('availability')
  async createAvailability(
    @Request() req,
    @Body()
    body: {
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      isAvailable?: boolean;
    },
  ) {
    const availability = await this.doctorService.createAvailability(
      req.user.userId,
      body,
    );
    return { message: 'Availability slot created successfully', availability };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('availability/:id')
  async updateAvailability(
    @Request() req,
    @Param('id') id: number,
    @Body() body: Partial<Availability>,
  ) {
    const availability = await this.doctorService.updateAvailability(
      req.user.userId,
      id,
      body,
    );
    return { message: 'Availability slot updated successfully', availability };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('availability/:id')
  async deleteAvailability(@Request() req, @Param('id') id: number) {
    await this.doctorService.deleteAvailability(req.user.userId, id);
    return { message: 'Availability slot deleted successfully' };
  }

  @Get(':id/availability')
  async getDoctorAvailability(@Param('id') id: number) {
    return this.doctorService.getDoctorAvailability(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('slot')
  async createSlot(
    @Request() req,
    @Body()
    body: {
      date: string;
      startTime: string;
      endTime: string;
      patientsPerSlot: number;
    },
  ) {
    const slot = await this.doctorService.createSlot(req.user.userId, body);
    return { message: 'Slot created successfully', slot };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('slot/:id')
  async updateSlot(
    @Request() req,
    @Param('id') id: number,
    @Body() body: Partial<Slot>,
  ) {
    const slot = await this.doctorService.updateSlot(req.user.userId, id, body);
    return { message: 'Slot updated successfully', slot };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('slot/:id')
  async deleteSlot(@Request() req, @Param('id') id: number) {
    await this.doctorService.deleteSlot(req.user.userId, id);
    return { message: 'Slot deleted successfully' };
  }

  @Get(':id/slots')
  async getAvailableSlots(@Param('id') id: number) {
    const slots = await this.doctorService.getAvailableSlotsWithMeta(id);
    return { message: 'Available slots fetched successfully', slots };
  }
}
