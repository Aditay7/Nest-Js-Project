import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Doctor } from './doctor.entity';

@Entity({ name: 'chats' })
export class Chat {
  @PrimaryGeneratedColumn({ name: 'chat_id' })
  chatId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Doctor)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @Column({ type: 'text' })
  message: string;

  @Column()
  sender: string;

  @Column({ name: 'sent_at', type: 'timestamp' })
  sentAt: Date;
}
