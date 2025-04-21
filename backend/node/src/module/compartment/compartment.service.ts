import { ICompartment } from "../../models/Compartment";
import CompartmentSchema from "../../schema/CompartmentSchema";

class Compartment implements ICompartment {
    async setCompartmentStatus(sensorId: string, isFull: boolean): Promise<void> {
        const compartment = await CompartmentSchema.findOne({ sensorId });
        if (!compartment) {
            throw new Error('Compartment not found');
        }
        compartment.isFull = isFull;
        await compartment.save();
    }

    async getCompartmentStatus(id: string): Promise<string> {
        const compartment = await CompartmentSchema.findById(id);
        if (!compartment) {
            throw new Error('Compartment not found');
        }
        return compartment.isFull ? 'full' : 'empty';
    }

    async getCompartmentById(id: string): Promise<any> {
        const compartment = await CompartmentSchema.findById(id);
        if (!compartment) {
            throw new Error('Compartment not found');
        }
        return compartment;
    }

    async getCompartmentBySensorId(sensorId: string): Promise<any> {
        const compartment = await CompartmentSchema.findOne({ sensorId });
        if (!compartment) {
            throw new Error('Compartment not found');
        }
        return compartment;
    }
}

export default new Compartment();