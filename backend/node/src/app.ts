import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import trashRoutes from './trashBin/trashRoute';
// import trashBinRoutes from './routes/trashBinRoutes';
import authRoute from './auth/auth.router';
import errorHandler from './error/errorHandler';
// import { setupMQTT } from "../src/trashBin/mqttHandler";
// import { setupWebSocket, sendWebSocketMessage } from "../src/trashBin/websocket";

// const PORT = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoute);
app.use('/api/trash', trashRoutes);

// API để mở nắp thùng rác
// app.post("/open-lid", (req, res) => {
//   openLid();
//   res.json({ message: "Lid opened!" });
// });

// Khởi chạy WebSocket
// const server = app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
// setupWebSocket(server);

// Khởi động MQTT nếu cần
// setupMQTT(sendWebSocketMessage);

app.get('/', (req, res) => {
  res.send('Trash Bin Monitoring API');
});

app.use(errorHandler);

export default app;