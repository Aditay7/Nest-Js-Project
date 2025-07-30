import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Doctor } from './doctor.entity';

export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

export enum SessionType {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  EVENING = 'evening',
  CUSTOM = 'custom',
}

@Entity({ name: 'doctor_availability' })
export class DoctorAvailability {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'doctor_id' })
  doctorId: number;

  @ManyToOne(() => Doctor, (doctor) => doctor.userId)
  @JoinColumn({ name: 'doctor_id', referencedColumnName: 'userId' })
  doctor: Doctor;

  @Column('simple-array')
  daysOfWeek: DayOfWeek[]; // Array of days like [1, 2] for Monday and Tuesday

  @Column()
  startTime: string; // 'HH:mm'

  @Column()
  endTime: string; // 'HH:mm'

  @Column({
    type: 'enum',
    enum: SessionType,
    default: SessionType.CUSTOM,
  })
  sessionType: SessionType;

  @Column({ default: true })
  isActive: boolean; // For soft delete

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
