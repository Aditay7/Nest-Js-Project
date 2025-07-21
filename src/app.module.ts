import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmModuleConfig } from './config/database.config';
import { UserModule } from './modules/user/user.module';
import { DoctorModule } from './modules/doctor/doctor.module';
import { PatientModule } from './modules/patient/patient.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { AppointmentModule } from './modules/appointment/appointment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // <== makes config available everywhere
    }),
    TypeOrmModule.forRoot(typeOrmModuleConfig),
    UserModule,
    DoctorModule,
    PatientModule,
    AuthModule,
    AppointmentModule,
  ],
})
export class AppModule {}
