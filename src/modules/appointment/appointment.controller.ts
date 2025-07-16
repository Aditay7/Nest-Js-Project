import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('appointment')
@UseGuards(JwtAuthGuard)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  async bookAppointment(@Request() req, @Body() body) {
    return this.appointmentService.bookAppointment(req.user.userId, body);
  }

  @Get()
  async getAppointments(@Request() req) {
    return this.appointmentService.getUserAppointments(req.user.userId);
  }

  @Patch(':id/reschedule')
  async reschedule(@Param('id') id: number, @Body() body) {
    return this.appointmentService.rescheduleAppointment(id, body);
  }

  @Delete(':id')
  async cancel(@Param('id') id: number) {
    return this.appointmentService.cancelAppointment(id);
  }
}
