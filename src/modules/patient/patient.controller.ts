import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/lib/db/entities/user.entity';

@Controller('patient')
@UseGuards(JwtAuthGuard)
export class PatientController {
  constructor(
    private readonly patientService: PatientService,
    @InjectRepository(User) private readonly patientRepository: any,
  ) {}

  @Post('details')
  async addDetails(@Request() req, @Body() body) {
    const patient = await this.patientService.addOrUpdateDetails(
      req.user.userId,
      body,
    );
    return { message: 'Patient details saved successfully', patient };
  }

  @Patch('details')
  async updateDetails(@Request() req, @Body() body) {
    const patient = await this.patientService.addOrUpdateDetails(
      req.user.userId,
      body,
    );
    return { message: 'Patient details updated successfully', patient };
  }

  @Get('details')
  async getDetails(@Request() req) {
    const patient = await this.patientService.getDetails(req.user.userId);
    if (!patient) throw new BadRequestException('Patient not found');
    const user = await this.patientRepository.manager.findOne(User, {
      where: { userId: req.user.userId },
    });
    return {
      userId: req.user.userId,
      user,
      patient,
    };
  }

  @Get()
  async getAllPatients() {
    const patients = await this.patientService.getAllPatients();
    const users = await this.patientRepository.manager.find(User, {
      where: {},
    });
    return patients.map((patient) => {
      const user = users.find(
        (u) => u.userId === (patient.user?.userId || patient.userId),
      );
      return {
        userId: user?.userId,
        user,
        patient,
      };
    });
  }
}
