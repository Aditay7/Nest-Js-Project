import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from 'src/lib/db/entities/appointment.entity';
import { Availability } from 'src/lib/db/entities/availability.entity';
import { RescheduleRequest } from 'src/lib/db/entities/reschedule-request.entity';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,
    @InjectRepository(RescheduleRequest)
    private readonly rescheduleRepository: Repository<RescheduleRequest>,
  ) {}

  async bookAppointment(userId: number, body: any) {
    const { doctorId, scheduledOn } = body;
    // Check slot availability
    const existing = await this.appointmentRepository.findOne({
      where: { doctorId, scheduledOn, status: 'booked' },
    });
    if (existing) throw new BadRequestException('Slot already booked');
    const appointment = this.appointmentRepository.create({
      userId,
      doctorId,
      scheduledOn,
      status: 'booked',
    });
    return this.appointmentRepository.save(appointment);
  }

  async getUserAppointments(userId: number) {
    return this.appointmentRepository.find({ where: { userId } });
  }

  async rescheduleAppointment(appointmentId: number, body: any) {
    const { newDate, newTime } = body;
    const appointment = await this.appointmentRepository.findOne({
      where: { appointmentId },
    });
    if (!appointment) throw new BadRequestException('Appointment not found');
    // Check if new slot is available
    const slotTaken = await this.appointmentRepository.findOne({
      where: {
        doctorId: appointment.doctorId,
        scheduledOn: `${newDate} ${newTime}`,
        status: 'booked',
      },
    });
    if (slotTaken) throw new BadRequestException('New slot already booked');
    // Save reschedule request
    await this.rescheduleRepository.save({
      appointmentId,
      old_date: appointment.scheduledOn.split(' ')[0],
      old_time: appointment.scheduledOn.split(' ')[1],
      new_date: newDate,
      new_time: newTime,
      rescheduled_at: new Date(),
    });
    appointment.scheduledOn = `${newDate} ${newTime}`;
    await this.appointmentRepository.save(appointment);
    return appointment;
  }

  async cancelAppointment(appointmentId: number) {
    const appointment = await this.appointmentRepository.findOne({
      where: { appointmentId },
    });
    if (!appointment) throw new BadRequestException('Appointment not found');
    appointment.status = 'cancelled';
    await this.appointmentRepository.save(appointment);
    return { message: 'Appointment cancelled' };
  }
}
