// src/module/sensor/sensor.route.ts
import express from 'express';
import { handleSensorData } from './sensor.controller';

const router = express.Router();

router.post('/', handleSensorData);

export default router;