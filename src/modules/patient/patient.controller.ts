import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  UseGuards,
  Request,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('patient')
@UseGuards(JwtAuthGuard)
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post('register')
  async addDetails(@Request() req, @Body() body) {
    if (!body.medical_history || !body.blood_type)
      throw new BadRequestException(
        'medical_history and blood_type are required',
      );
    const patient = await this.patientService.addOrUpdateDetails(
      req.user.userId,
      body,
    );
    return { message: 'Patient details saved successfully', patient };
  }

  @Patch('update')
  async update(@Request() req, @Body() body) {
    const patient = await this.patientService.updatePatient(
      req.user.userId,
      body,
    );
    return { message: 'Patient details updated successfully', patient };
  }

  @Get('profile')
  async getProfile(@Request() req) {
    const patient = await this.patientService.getPatientById(req.user.userId);
    return { patient };
  }

  @Get(':id')
  async getPatientById(@Param('id') id: number) {
    const patient = await this.patientService.getPatientById(id);
    return { patient };
  }
}
