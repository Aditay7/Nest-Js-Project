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
  BadRequestException,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('appointment')
@UseGuards(JwtAuthGuard)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  async bookAppointment(@Request() req, @Body() body) {
    const appointment = await this.appointmentService.bookAppointment(
      req.user.userId,
      body,
    );
    return { message: 'Appointment booked successfully', appointment };
  }

  @Get()
  async getAppointments(@Request() req) {
    return this.appointmentService.getUserAppointments(req.user.userId);
  }

  @Patch(':id/reschedule')
  async reschedule(@Param('id') id: number, @Body() body) {
    const appointment = await this.appointmentService.rescheduleAppointment(
      id,
      body,
    );
    return { message: 'Appointment rescheduled successfully', appointment };
  }

  @Delete(':id')
  async cancel(@Param('id') id: number) {
    await this.appointmentService.cancelAppointment(id);
    return { message: 'Appointment cancelled successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('reschedule-all')
  async rescheduleAllAppointments(
    @Request() req,
    @Body() body: { shift_minutes: number },
  ) {
    const doctorId = req.user.userId;
    const { shift_minutes } = body;
    if (
      !shift_minutes ||
      Math.abs(shift_minutes) < 10 ||
      Math.abs(shift_minutes) > 180
    ) {
      throw new BadRequestException('Shift must be between 10 and 180 minutes');
    }
    const result = await this.appointmentService.rescheduleAllAppointments(
      doctorId,
      shift_minutes,
    );
    return { message: 'All future appointments rescheduled', result };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('reschedule-selected')
  async rescheduleSelectedAppointments(
    @Request() req,
    @Body() body: { appointment_ids: number[]; shift_minutes: number },
  ) {
    const doctorId = req.user.userId;
    const { appointment_ids, shift_minutes } = body;
    if (!Array.isArray(appointment_ids) || appointment_ids.length === 0) {
      throw new BadRequestException('No appointment_ids provided');
    }
    if (
      !shift_minutes ||
      Math.abs(shift_minutes) < 10 ||
      Math.abs(shift_minutes) > 180
    ) {
      throw new BadRequestException('Shift must be between 10 and 180 minutes');
    }
    const result = await this.appointmentService.rescheduleSelectedAppointments(
      doctorId,
      appointment_ids,
      shift_minutes,
    );
    return { message: 'Selected appointments rescheduled', result };
  }
}
