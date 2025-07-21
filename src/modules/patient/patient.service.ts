import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from 'src/lib/db/entities/patient.entity';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async addOrUpdateDetails(userId: number, details: Partial<Patient>) {
    let patient = await this.patientRepository.findOne({
      where: { user: { userId } },
    });
    if (patient) {
      await this.patientRepository.update(userId, details);
      return this.patientRepository.findOne({ where: { user: { userId } } });
    } else {
      patient = this.patientRepository.create({
        userId,
        user: { userId } as any,
        ...details,
      });
      return this.patientRepository.save(patient);
    }
  }

  async getDetails(userId: number) {
    return this.patientRepository.findOne({ where: { user: { userId } } });
  }

  async getAllPatients() {
    return this.patientRepository.find({ relations: ['user'] });
  }
}
