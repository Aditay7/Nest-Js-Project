import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Doctor } from './doctor.entity';
import { SessionType } from './doctor-availability.entity';

@Entity({ name: 'slots' })
export class Slot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'doctor_id' })
  doctorId: number;

  @ManyToOne(() => Doctor, (doctor) => doctor.userId)
  @JoinColumn({ name: 'doctor_id', referencedColumnName: 'userId' })
  doctor: Doctor;

  @Column({ type: 'date' })
  date: string; // 'YYYY-MM-DD'

  @Column()
  startTime: string; // 'HH:mm'

  @Column()
  endTime: string; // 'HH:mm'

  @Column({ default: 1 })
  capacity: number;

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
