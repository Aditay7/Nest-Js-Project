import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from 'src/lib/db/entities/doctor.entity';
import { User } from 'src/lib/db/entities/user.entity';
import { DoctorAvailability } from 'src/lib/db/entities/doctor-availability.entity';
import { DoctorAvailOverride } from 'src/lib/db/entities/doctor-avail-override.entity';
import { Slot } from 'src/lib/db/entities/slot.entity';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { SlotGateway } from './slot.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Doctor,
      User,
      DoctorAvailability,
      DoctorAvailOverride,
      Slot,
    ]),
  ],
  providers: [DoctorService, SlotGateway],
  controllers: [DoctorController],
  exports: [DoctorService],
})
export class DoctorModule {}
