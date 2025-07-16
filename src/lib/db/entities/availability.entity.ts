import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'availability' })
export class Availability {
  @PrimaryGeneratedColumn({ name: 'availability_id' })
  availabilityId: number;

  @Column({ name: 'doctor_id' })
  doctorId: number;

  @Column({ name: 'is_available' })
  isAvailable: boolean;

  @Column({ name: 'day_of_week' })
  dayOfWeek: string;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;
}
