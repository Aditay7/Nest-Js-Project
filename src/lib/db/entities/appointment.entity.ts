import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'appointments' })
export class Appointment {
  @PrimaryGeneratedColumn({ name: 'appointment_id' })
  appointmentId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'doctor_id' })
  doctorId: number;

  @Column()
  scheduledOn: string;

  @Column()
  status: string;
}
