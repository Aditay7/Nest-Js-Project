import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from 'src/lib/db/entities/doctor.entity';
import { Availability } from 'src/lib/db/entities/availability.entity';
import { Slot } from 'src/lib/db/entities/slot.entity';
import { Appointment } from 'src/lib/db/entities/appointment.entity';
import { AppointmentStatus } from 'src/lib/db/entities/appointment.entity';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,
  ) {}

  async findByUserId(userId: number): Promise<Doctor | null> {
    return this.doctorRepository.findOne({ where: { userId } });
  }

  async createDoctor({
    userId,
    specialization = '',
    years_of_experience = '',
    profile_pic = '',
    bio = '',
    ...rest
  }: {
    userId: number;
    specialization?: string;
    years_of_experience?: string;
    profile_pic?: string;
    bio?: string;
    [key: string]: any;
  }): Promise<Doctor> {
    const doctor = this.doctorRepository.create({
      userId,
      specialization,
      years_of_experience,
      profile_pic,
      bio,
    });
    return this.doctorRepository.save(doctor);
  }

  async updateDoctorProfile(
    userId: number,
    update: Partial<Doctor>,
  ): Promise<void> {
    await this.doctorRepository.update(userId, update);
  }

  async findDoctorsBySpecialization(
    specialization?: string,
  ): Promise<Doctor[]> {
    if (specialization) {
      return this.doctorRepository.find({ where: { specialization } });
    }
    return this.doctorRepository.find();
  }

  async getDoctorProfileWithAvailability(userId: number) {
    const doctor = await this.doctorRepository.findOne({ where: { userId } });
    if (!doctor) return null;
    const availability = await this.availabilityRepository.find({
      where: { doctor: { userId }, isAvailable: true },
    });
    return { ...doctor, availability };
  }

  async createAvailability(
    userId: number,
    data: {
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      isAvailable?: boolean;
    },
  ) {
    const availability = this.availabilityRepository.create({
      doctor: { userId } as any,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      isAvailable: data.isAvailable ?? true,
    });
    return this.availabilityRepository.save(availability);
  }

  async updateAvailability(
    userId: number,
    availabilityId: number,
    data: {
      dayOfWeek?: string;
      startTime?: string;
      endTime?: string;
      isAvailable?: boolean;
    },
  ) {
    const availability = await this.availabilityRepository.findOne({
      where: { availabilityId, doctor: { userId } },
    });
    if (!availability)
      throw new Error('Availability slot not found or not owned by doctor');
    Object.assign(availability, data);
    return this.availabilityRepository.save(availability);
  }

  async deleteAvailability(userId: number, availabilityId: number) {
    const availability = await this.availabilityRepository.findOne({
      where: { availabilityId, doctor: { userId } },
    });
    if (!availability)
      throw new Error('Availability slot not found or not owned by doctor');
    return this.availabilityRepository.remove(availability);
  }

  async getDoctorAvailability(userId: number) {
    return this.availabilityRepository.find({
      where: { doctor: { userId }, isAvailable: true },
    });
  }

  async createSlot(
    userId: number,
    data: {
      date: string;
      startTime: string;
      endTime: string;
      patientsPerSlot: number;
    },
  ) {
    // Optionally, validate that the slot is within doctor's availability
    const slot = this.availabilityRepository.manager.create(Slot, {
      doctor: { userId } as any,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      patientsPerSlot: data.patientsPerSlot,
    });
    return this.availabilityRepository.manager.save(Slot, slot);
  }

  async updateSlot(userId: number, slotId: number, data: Partial<Slot>) {
    const slot = await this.availabilityRepository.manager.findOne(Slot, {
      where: { slotId, doctor: { userId } },
    });
    if (!slot) throw new Error('Slot not found or not owned by doctor');
    Object.assign(slot, data);
    return this.availabilityRepository.manager.save(Slot, slot);
  }

  async deleteSlot(userId: number, slotId: number) {
    const slot = await this.availabilityRepository.manager.findOne(Slot, {
      where: { slotId, doctor: { userId } },
    });
    if (!slot) throw new Error('Slot not found or not owned by doctor');
    return this.availabilityRepository.manager.remove(Slot, slot);
  }

  async getAvailableSlotsWithMeta(userId: number) {
    // Get all slots for the doctor
    const slots = await this.availabilityRepository.manager.find(Slot, {
      where: { doctor: { userId } },
    });
    // For each slot, count booked appointments and calculate meta
    const slotsWithMeta = await Promise.all(
      slots.map(async (slot) => {
        const bookedCount = await this.availabilityRepository.manager.count(
          Appointment,
          {
            where: {
              slot: { slotId: slot.slotId },
              status: AppointmentStatus.BOOKED,
            },
          },
        );
        const slotDuration =
          (parseTime(slot.endTime) - parseTime(slot.startTime)) / 60000; // in minutes
        const reportingTime =
          slot.patientsPerSlot > 0 ? slotDuration / slot.patientsPerSlot : 0;
        return {
          ...slot,
          slotDuration,
          reportingTime,
          available: bookedCount < slot.patientsPerSlot,
          bookedCount,
        };
      }),
    );
    // Only return slots that are not fully booked
    return slotsWithMeta.filter((slot) => slot.available);
  }
}

// Helper to parse HH:mm to ms
function parseTime(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 * 60 * 1000 + m * 60 * 1000;
}
