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
    let patient = await this.patientRepository.findOne({ where: { userId } });
    if (patient) {
      await this.patientRepository.update(patient.detailId, details);
      return this.patientRepository.findOne({ where: { userId } });
    } else {
      patient = this.patientRepository.create({ userId, ...details });
      return this.patientRepository.save(patient);
    }
  }

  async updateDetails(detailId: number, details: Partial<Patient>) {
    await this.patientRepository.update(detailId, details);
    return this.patientRepository.findOne({ where: { detailId } });
  }

  async getDetails(userId: number) {
    return this.patientRepository.findOne({ where: { userId } });
  }
}
