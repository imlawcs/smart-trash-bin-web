import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import e from 'express';

let io: Server;

export const initSocket = (server: HttpServer) => {
  console.log('Initializing WebSocket server...');
  io = new Server(server, {
    cors: {
      origin: "*"
    }
  });

  io.on('connection', (socket) => {
    console.log('Frontend connected via WebSocket');

    socket.on('disconnect', () => {
      console.log('Frontend disconnected');
    });
  });
};

export const sendTrashFullAlert = ({
  binId,
  compartmentType,
  sensorId,
}: {
  binId: string;
  compartmentType: string;
  sensorId?: string;
}) => {
  if (io) {
    console.log('Sending trash-full alert:', { binId, compartmentType, sensorId });
    io.emit('trash-full', {
      message: 'Trash bin is full!',
      binId,
      compartmentType,
      sensorId,
      timestamp: new Date(),
    });
    console.log('Emitted trash-full event');
  } else {
    console.error('WebSocket server not initialized');
  }
};

export const sendTrashAvailableAlert = ({
  binId,
  compartmentType,
  sensorId,
}: {
  binId: string;
  compartmentType: string;
  sensorId?: string;
}) => {
  if (io) {
    console.log('Sending trash-available alert:', { binId, compartmentType, sensorId });
    io.emit('trash-available', {
      message: 'Trash bin is available!',
      binId,
      compartmentType,
      sensorId,
      timestamp: new Date(),
    });
    console.log('Emitted trash-available event');
  } else {
    console.error('WebSocket server not initialized');
  }
}