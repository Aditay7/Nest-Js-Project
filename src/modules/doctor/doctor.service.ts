import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from 'src/lib/db/entities/doctor.entity';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {}

  async findByEmail(email: string): Promise<Doctor | null> {
    return this.doctorRepository.findOne({ where: { email } });
  }

  async createFromGoogle({
    email,
    name,
    ...rest
  }: {
    email: string;
    name: string;
    [key: string]: any;
  }): Promise<Doctor> {
    const doctor = this.doctorRepository.create({ email, name, ...rest });
    return this.doctorRepository.save(doctor);
  }

  async updateDoctorProfile(
    doctorId: number,
    update: Partial<Doctor>,
  ): Promise<void> {
    await this.doctorRepository.update(doctorId, update);
  }
}
