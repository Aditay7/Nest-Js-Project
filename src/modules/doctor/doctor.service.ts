import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from 'src/lib/db/entities/doctor.entity';
import { Availability } from 'src/lib/db/entities/availability.entity';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,
  ) {}

  async findByEmail(email: string): Promise<Doctor | null> {
    return this.doctorRepository.findOne({ where: { email } });
  }

  async createFromGoogle({
    email,
    name,
    specialization = '',
    years_of_experience = '',
    phone = '',
    profile_pic = '',
    bio = '',
    gender = '',
    ...rest
  }: {
    email: string;
    name: string;
    specialization?: string;
    years_of_experience?: string;
    phone?: string;
    profile_pic?: string;
    bio?: string;
    gender?: string;
    [key: string]: any;
  }): Promise<Doctor> {
    const doctor = this.doctorRepository.create({
      email,
      name,
      specialization,
      years_of_experience,
      phone,
      profile_pic,
      bio,
      gender,
      ...rest,
    });
    return this.doctorRepository.save(doctor);
  }

  async updateDoctorProfile(
    doctorId: number,
    update: Partial<Doctor>,
  ): Promise<void> {
    await this.doctorRepository.update(doctorId, update);
  }

  async findDoctorsBySpecialization(
    specialization?: string,
  ): Promise<Doctor[]> {
    if (specialization) {
      return this.doctorRepository.find({ where: { specialization } });
    }
    return this.doctorRepository.find();
  }

  async getDoctorProfileWithAvailability(doctorId: number) {
    const doctor = await this.doctorRepository.findOne({ where: { doctorId } });
    if (!doctor) return null;
    const availability = await this.availabilityRepository.find({
      where: { doctorId, isAvailable: true },
    });
    return { ...doctor, availability };
  }
}
