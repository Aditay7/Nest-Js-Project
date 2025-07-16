import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'reschedule_request' })
export class RescheduleRequest {
  @PrimaryGeneratedColumn({ name: 'reschedule_id' })
  rescheduleId: number;

  @Column({ name: 'appointment_id' })
  appointmentId: number;

  @Column({ name: 'old_date', type: 'date' })
  oldDate: string;

  @Column({ name: 'old_time', type: 'time' })
  oldTime: string;

  @Column({ name: 'new_date', type: 'date' })
  newDate: string;

  @Column({ name: 'new_time', type: 'time' })
  newTime: string;

  @Column({ name: 'rescheduled_at', type: 'timestamp' })
  rescheduledAt: Date;
}
