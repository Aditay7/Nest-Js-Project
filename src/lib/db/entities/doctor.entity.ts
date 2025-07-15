import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'doctors' })
export class Doctor {
  @PrimaryGeneratedColumn({ name: 'doctor_id' })
  doctorId: number;

  @Column()
  name: string;

  @Column()
  specialization: string;

  @Column()
  years_of_experience: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  profile_pic: string;

  @Column()
  bio: string;
} 