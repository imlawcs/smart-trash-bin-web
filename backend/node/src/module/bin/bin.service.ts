import BinSchema from '../../schema/BinSchema';
import Compartment from '../../schema/CompartmentSchema';
import { Bin, IBinService } from '../../models/Bin';

class BinService implements IBinService {

  async getBinById(id: string): Promise<Bin> {
    const bin : Bin | null = await BinSchema.findById(id);
    // console.log('Tìm bin trong service với ID:', id);
    if (!bin) {
      throw new Error('Bin not found');
    }
    // const compartments = await Compartment.find({ binId: id });
    
    // if (!compartments) {
    //   throw new Error('No compartments found for this bin');
    // }

    // bin.compartments = compartments.map(compartment => ({
    //   id: compartment._id,
    //   type: compartment.type,
    //   isFull: compartment.isFull,
    //   sensorId: compartment.sensorId,
    //   binId: compartment.binId.toString(),
    //   updatedAt: compartment.updatedAt,
    // }));   
    return bin;
  }

  async createBin(bin: { name: string; latitude: number; longitude: number }): Promise<Bin> {
    const newBin = await BinSchema.create(bin);
    return newBin;
  }

  async getAllBins(): Promise<Bin[]> {
    const bins = await BinSchema.find();
    return bins;
  }

  async updateBin(id: string, bin: { name: string; latitude: number; longitude: number }): Promise<Bin> {
    const updatedBin = await BinSchema.findByIdAndUpdate(id, bin, { new: true });
    if (!updatedBin) {
      throw new Error('Bin not found');
    }
    return updatedBin;
  }

  async deleteBin(id: string): Promise<void> {
    const bin = await BinSchema.findByIdAndDelete(id);
    if (!bin) {
      throw new Error('Bin not found');
    }
  }
}

export default new BinService();
