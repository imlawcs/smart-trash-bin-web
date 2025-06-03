// src/module/sensor/sensor.route.ts
import express from 'express';
import { handleSensorData } from './sensor.controller';
import auth from '../../middlewares/authMiddleware';
import mailService from '../../middlewares/mailService';

const router = express.Router();

router.post('/', auth.authenticateToken, handleSensorData);
router.get('/test', auth.authenticateToken, mailService.sendEmail);

export default router;