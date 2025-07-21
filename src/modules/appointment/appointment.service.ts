import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Appointment } from 'src/lib/db/entities/appointment.entity';
import { Availability } from 'src/lib/db/entities/availability.entity';
import { RescheduleRequest } from 'src/lib/db/entities/reschedule-request.entity';
import { Slot } from 'src/lib/db/entities/slot.entity';
import { AppointmentStatus } from 'src/lib/db/entities/appointment.entity';

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

  async bookAppointment(
    userId: number,
    body: { slotId: number },
  ): Promise<Appointment> {
    const { slotId } = body;
    const slot = await this.availabilityRepository.manager.findOne(Slot, {
      where: { slotId },
    });
    if (!slot) throw new BadRequestException('Slot not found');
    // Count booked appointments for this slot
    const bookedCount = await this.appointmentRepository.count({
      where: { slot: { slotId }, status: AppointmentStatus.BOOKED },
    });
    if (bookedCount >= slot.patientsPerSlot)
      throw new BadRequestException('Slot is fully booked');
    const appointment = this.appointmentRepository.create({
      user: { userId } as any,
      doctor: slot.doctor,
      slot: { slotId } as any,
      status: AppointmentStatus.BOOKED,
    });
    return this.appointmentRepository.save(appointment);
  }

  async getUserAppointments(userId: number): Promise<Appointment[]> {
    return this.appointmentRepository.find({ where: { user: { userId } } });
  }

  async rescheduleAppointment(
    appointmentId: number,
    body: { newSlotId: number },
  ): Promise<Appointment> {
    const { newSlotId } = body;
    const appointment = await this.appointmentRepository.findOne({
      where: { appointmentId },
    });
    if (!appointment) throw new BadRequestException('Appointment not found');
    const slot = await this.availabilityRepository.manager.findOne(Slot, {
      where: { slotId: newSlotId },
    });
    if (!slot) throw new BadRequestException('Slot not found');
    const bookedCount = await this.appointmentRepository.count({
      where: { slot: { slotId: newSlotId }, status: AppointmentStatus.BOOKED },
    });
    if (bookedCount >= slot.patientsPerSlot)
      throw new BadRequestException('Slot is fully booked');
    appointment.slot = slot;
    appointment.status = AppointmentStatus.RESCHEDULED;
    await this.appointmentRepository.save(appointment);
    return appointment;
  }

  async cancelAppointment(appointmentId: number): Promise<{ message: string }> {
    const appointment = await this.appointmentRepository.findOne({
      where: { appointmentId },
    });
    if (!appointment) throw new BadRequestException('Appointment not found');
    appointment.status = AppointmentStatus.CANCELLED;
    await this.appointmentRepository.save(appointment);
    return { message: 'Appointment cancelled' };
  }

  async rescheduleAllAppointments(doctorId: number, shift_minutes: number) {
    // Find all future appointments for this doctor
    const now = new Date();
    const appointments = await this.appointmentRepository.find({
      where: { doctor: { userId: doctorId } },
      relations: ['slot'],
    });
    const futureAppointments = appointments.filter((appt) => {
      const slotDateTime = new Date(`${appt.slot.date}T${appt.slot.startTime}`);
      return slotDateTime > now;
    });
    if (futureAppointments.length === 0)
      throw new BadRequestException('No future appointments to reschedule');
    for (const appt of futureAppointments) {
      appt.slot.startTime = shiftTime(appt.slot.startTime, shift_minutes);
      appt.slot.endTime = shiftTime(appt.slot.endTime, shift_minutes);
      await this.availabilityRepository.manager.save(appt.slot);
    }
    return { count: futureAppointments.length };
  }

  async rescheduleSelectedAppointments(
    doctorId: number,
    appointment_ids: number[],
    shift_minutes: number,
  ) {
    const appointments = await this.appointmentRepository.find({
      where: { appointmentId: In(appointment_ids) },
      relations: ['slot'],
    });
    if (appointments.length === 0)
      throw new BadRequestException('No appointments found');
    for (const appt of appointments) {
      if (appt.doctor?.userId !== doctorId) continue;
      appt.slot.startTime = shiftTime(appt.slot.startTime, shift_minutes);
      appt.slot.endTime = shiftTime(appt.slot.endTime, shift_minutes);
      await this.availabilityRepository.manager.save(appt.slot);
    }
    return { count: appointments.length };
  }
}

// Helper to shift time string by minutes
function shiftTime(time: string, shift: number): string {
  const [h, m] = time.split(':').map(Number);
  const date = new Date(0, 0, 0, h, m + shift);
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}
