import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { LocationObjectType } from './types/location-data.type';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'http://gc.questsrv.com:3000',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class DeviceLocationGateway {
  @WebSocketServer()
  server: Server;

  sendLocationUpdate(data: LocationObjectType) {
    console.log('📤 Emitting to clients:', data);
    this.server.emit('device-location-updated', data);
  }

  sendBatchLocationUpdate(data: LocationObjectType[]) {
    console.log('📤 Emitting to clients:', data);
    this.server.emit('batch-device-location-updated', data);
  }

  sendCollectedUpdate(data: {
    session_id: string,
    collected_point_id: string,
    push_timestamp: number,
    collected_timestamp: string,
    collection_point: any
  }) {
    console.log('📤 Emitting to clients:', data);
    this.server.emit('collected-point-updated', data);
  }

}
