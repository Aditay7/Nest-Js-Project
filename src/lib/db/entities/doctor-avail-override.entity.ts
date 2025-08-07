import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Doctor } from './doctor.entity';
import { SessionType } from './doctor-availability.entity';

@Entity({ name: 'doctor_avail_override' })
export class DoctorAvailOverride {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'doctor_id' })
  doctorId: number;

  @ManyToOne(() => Doctor, (doctor) => doctor.userId)
  @JoinColumn({ name: 'doctor_id', referencedColumnName: 'userId' })
  doctor: Doctor;

  @Column({ type: 'date' })
  date: string; // 'YYYY-MM-DD'

  @Column({ nullable: true })
  startTime: string; // 'HH:mm', nullable if not available

  @Column({ nullable: true })
  endTime: string; // 'HH:mm', nullable if not available

  @Column({ default: true })
  isAvailable: boolean; // false = not available at all on this date

  @Column({
    type: 'enum',
    enum: SessionType,
    nullable: true,
  })
  sessionType: SessionType; // 'morning', 'afternoon', 'evening', 'custom'

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
