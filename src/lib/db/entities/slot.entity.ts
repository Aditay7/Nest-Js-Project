import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Doctor } from './doctor.entity';

@Entity({ name: 'slots' })
export class Slot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'doctor_id' })
  doctorId: number;

  @ManyToOne(() => Doctor, (doctor) => doctor.userId)
  @JoinColumn({ name: 'doctor_id', referencedColumnName: 'userId' })
  doctor: Doctor;

  @Column()
  startTime: string; // 'HH:mm'

  @Column()
  endTime: string; // 'HH:mm'

  @Column({ default: 1 })
  capacity: number;

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
