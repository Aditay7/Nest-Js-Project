import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'patient_details' })
export class Patient {
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text' })
  medical_history: string;

  @Column({ type: 'text' })
  blood_type: string;

  @Column({ type: 'text' })
  height: string;

  @Column({ type: 'text' })
  weight: string;

  @Column({ type: 'text' })
  allergies: string;

  @Column({ type: 'text' })
  notes: string;

  @Column({ type: 'text' })
  current_medications: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
