import { Request, Response } from 'express';
import Compartment from '../compartment/compartment.service';
import { sendTrashFullAlert, sendTrashAvailableAlert } from '../../socket/socket';
import Bin from '../bin/bin.service';

export const handleSensorData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { isFull, binId, compartmentType, sensorId } = req.body;

    if (!sensorId || typeof isFull === 'undefined') {
      res.status(400).json({ message: 'Missing sensorId or isFull in request body' });
      return;
    }

    const bin = await Bin.getBinById(binId);
    if (!bin) {
      res.status(404).json({ message: 'Bin not found' });
      return;
    }
    const binName = bin.name;
    
    const compartment = await Compartment.getCompartmentBySensorId(sensorId);
    if (compartment && compartment.isFull !== isFull) { // Chỉ gửi nếu trạng thái thay đổi
      await Compartment.setCompartmentStatus(sensorId, isFull);

      // Gửi thông báo cho cả trạng thái đầy và không đầy
      if (isFull) {
        sendTrashFullAlert({
          binId,
          compartmentType,
          sensorId,
        });
      }
      else {
        sendTrashAvailableAlert({
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