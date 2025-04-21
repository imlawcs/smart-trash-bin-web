import express from 'express';
import cors from 'cors';
import authRoute from './module/auth/auth.router';
import errorHandler from './error/errorHandler';
import sensorRouter from './module/sensor/sensor.route';
import binRouter from './module/bin/bin.router';
import compartmentRouter from './module/compartment/compatment.router';
import { initSocket } from './socket/socket';
import http from 'http';

const app = express();
const server = http.createServer(app);

// Khởi tạo WebSocket server
initSocket(server);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoute);
app.use('/api/sensor', sensorRouter);
app.use('/api/trash-bin', binRouter);
app.use('/api/compartment', compartmentRouter);

app.get('/', (req, res) => {
    res.send('Trash Bin Monitoring API');
});

app.use(errorHandler);

// Xuất app và server
export { app, server };