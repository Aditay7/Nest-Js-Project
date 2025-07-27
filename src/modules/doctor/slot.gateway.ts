import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ namespace: '/doctor/slots', cors: true })
export class SlotGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: any) {
    // Optionally, join doctor-specific room based on auth/userId
  }

  handleDisconnect(client: any) {}

  emitSlotCreated(doctorId: number, slot: any) {
    this.server.to(`doctor_${doctorId}`).emit('slotCreated', slot);
  }

  emitSlotUpdated(doctorId: number, slot: any) {
    this.server.to(`doctor_${doctorId}`).emit('slotUpdated', slot);
  }

  emitSlotDeleted(doctorId: number, slotId: number) {
    this.server.to(`doctor_${doctorId}`).emit('slotDeleted', { slotId });
  }
}
