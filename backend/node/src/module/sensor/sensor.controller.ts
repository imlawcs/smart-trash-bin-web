import { Request, Response } from 'express';
import Compartment from '../../module/compartment/compartment.service';
import { sendTrashFullAlert } from '../../socket/socket';

export const handleSensorData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { isFull, binId, compartmentType, sensorId } = req.body;

    if (!sensorId || typeof isFull === 'undefined') {
      res.status(400).json({ message: 'Missing sensorId or isFull in request body' });
      return;
    }

    // Kiểm tra trạng thái hiện tại của compartment
    const compartment = await Compartment.getCompartmentBySensorId(sensorId);
    if (compartment && compartment.isFull !== isFull) { // Chỉ gửi nếu trạng thái thay đổi
      await Compartment.setCompartmentStatus(sensorId, isFull);

      if (isFull) {
        console.log(`Sensor ${sensorId} reports FULL in ${compartmentType}`);
        sendTrashFullAlert({
          binId,
          compartmentType,
          sensorId,
        });
      }
    }

    res.status(200).json({ message: 'Sensor data processed successfully' });
  } catch (error) {
    console.error('Error handling sensor data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};