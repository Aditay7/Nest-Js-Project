import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'chats' })
export class Chat {
  @PrimaryGeneratedColumn({ name: 'chat_id' })
  chatId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'doctor_id' })
  doctorId: number;

  @Column({ type: 'text' })
  message: string;

  @Column()
  sender: string;

  @Column({ name: 'sent_at', type: 'timestamp' })
  sentAt: Date;
}
