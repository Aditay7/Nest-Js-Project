import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('patient')
@UseGuards(JwtAuthGuard)
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post('details')
  async addDetails(@Request() req, @Body() body) {
    return this.patientService.addOrUpdateDetails(req.user.userId, body);
  }

  @Patch('details/:id')
  async updateDetails(@Param('id') id: number, @Body() body) {
    return this.patientService.updateDetails(id, body);
  }

  @Get('details')
  async getDetails(@Request() req) {
    return this.patientService.getDetails(req.user.userId);
  }
}
