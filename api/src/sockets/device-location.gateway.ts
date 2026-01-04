import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:5173',
      'https://gcweb-psi.vercel.app',
      'https://gc-web-one.vercel.app',
      'https://gcweb-six.vercel.app',
      'https://gcweb-ten.vercel.app',
      'https://gcweb-fake.vercel.app',
      'https://gc-web1.netlify.app',
      'http://gc.questsrv.com:3000',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class DeviceLocationGateway {
  @WebSocketServer()
  server: Server;

  sendLocationUpdate(data: {
    session_id?: string;
    latitude: string;
    longitude: string;
    current_location_timestamp: string;
  }) {
    console.log('📤 Emitting to clients:', data); 
    this.server.emit('device-location-updated', data);
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
