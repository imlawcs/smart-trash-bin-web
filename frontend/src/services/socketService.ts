import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = (onTrashFull: (data: { message: string; binId: string; compartmentType: string; sensorId?: string; timestamp: string }) => void) => {
  if (socket) {
    console.log('WebSocket already initialized');
    return socket;
  }

  console.log('Initializing WebSocket connection...');
  socket = io('http://localhost:5000', { // Thay bằng URL thực của BE
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('Connected to WebSocket server');
  });

  socket.on('connect_error', (error) => {
    console.error('WebSocket connection error:', error.message);
  });

  socket.on('trash-full', (data: { message: string; binId: string; compartmentType: string; sensorId?: string; timestamp: string }) => {
    console.log('Received trash-full event:', data);
    onTrashFull(data);
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server');
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log('Disconnecting WebSocket...');
    socket.disconnect();
    socket = null;
  }
};