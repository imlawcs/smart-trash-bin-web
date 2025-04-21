import binService from "./bin.service";
import Compartment from "../../schema/CompartmentSchema";
import { log } from "console";

class BinController {
    public async getBinById(req: any, res: any, next: any): Promise<void> {
        const id = req.params.id;
        try {
            const bin = await binService.getBinById(id);
            res.status(200).json(bin);
        } catch (error) {
            next(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async getTrashBinById(req: any, res: any): Promise<void> {
        try {
            const id = req.params.id;
            console.log("ID from request params:", id);
            const bin = await binService.getBinById(id);
            if (!bin) {
                return res.status(404).json({ message: 'Trash bin not found' });
            }
            const compartments = await Compartment.find({ binId: id });
            return res.status(200).json({
                ...(typeof bin === 'object' ? bin : JSON.parse(JSON.stringify(bin))),
                compartments,
            });
            } catch (error) {
            console.error('Error fetching trash bin:', error);
            return res.status(500).json({ message: 'Internal server error' });
            }
      };

    public async createBin(req: any, res: any, next: any): Promise<void> {
        const bin = req.body;
        try {
            const newBin = await binService.createBin(bin);
            res.status(201).json(newBin);
        } catch (error) {
            next(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    public async getAllBins(req: any, res: any, next: any): Promise<void> {
        try {
            const bins = await binService.getAllBins();
            res.status(200).json(bins);
        } catch (error) {
            next(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    public async updateBin(req: any, res: any, next: any): Promise<void> {
        const id = req.params.id;
        const bin = req.body;
        try {
            const updatedBin = await binService.updateBin(id, bin);
            res.status(200).json(updatedBin);
        } catch (error) {
            next(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    public async deleteBin(req: any, res: any, next: any): Promise<void> {
        const id = req.params.id;
        try {
            await binService.deleteBin(id);
            res.status(204).send();
        } catch (error) {
            next(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

export default new BinController();