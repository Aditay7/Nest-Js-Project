import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';
import { Patient } from 'src/lib/db/entities/patient.entity';
import { User } from 'src/lib/db/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Patient, User])],
  controllers: [PatientController],
  providers: [PatientService],
  exports: [PatientService],
})
export class PatientModule {}
