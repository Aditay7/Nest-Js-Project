import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from 'src/lib/db/entities/appointment.entity';
import { Availability } from 'src/lib/db/entities/availability.entity';
import { RescheduleRequest } from 'src/lib/db/entities/reschedule-request.entity';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Availability, RescheduleRequest])],
  providers: [AppointmentService],
  controllers: [AppointmentController],
  exports: [AppointmentService],
})
export class AppointmentModule {} 