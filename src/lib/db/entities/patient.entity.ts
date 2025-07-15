import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'patient_details' })
export class Patient {
  @PrimaryGeneratedColumn({ name: 'detail_id' })
  detailId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'text' })
  medical_history: string;

  @Column({ type: 'text' })
  allergies: string;

  @Column({ type: 'text' })
  notes: string;
} 