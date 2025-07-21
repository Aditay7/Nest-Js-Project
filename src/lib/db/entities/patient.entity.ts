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
  allergies: string;

  @Column({ type: 'text' })
  notes: string;
}
