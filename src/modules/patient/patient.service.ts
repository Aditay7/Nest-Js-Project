import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from 'src/lib/db/entities/patient.entity';
import { User } from 'src/lib/db/entities/user.entity';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async addOrUpdateDetails(userId: number, details: Partial<Patient>) {
    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user) throw new NotFoundException('User not found');
    let patient = await this.patientRepository.findOne({ where: { userId } });
    if (patient) {
      Object.assign(patient, details);
      const savedPatient = await this.patientRepository.save(patient);
      // Update user role to 'patient'
      user.role = 'patient';
      await this.userRepository.save(user);
      return savedPatient;
    } else {
      patient = this.patientRepository.create({
        userId,
        user,
        ...details,
      });
      const savedPatient = await this.patientRepository.save(patient);
      // Update user role to 'patient'
      user.role = 'patient';
      await this.userRepository.save(user);
      return savedPatient;
    }
  }

  async updatePatient(userId: number, details: Partial<Patient>) {
    const patient = await this.patientRepository.findOne({ where: { userId } });
    if (!patient) throw new NotFoundException('Patient not found');
    Object.assign(patient, details);
    return this.patientRepository.save(patient);
  }

  async getPatientById(userId: number) {
    const patient = await this.patientRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
    if (!patient) throw new NotFoundException('Patient not found');
    return patient;
  }
}
