import { Compartment } from "./Compartment";

type Bin = {
    name: string;
    latitude: number;
    longitude: number;
    createdAt: Date;
    // compartments: Compartment[];
}

interface IBinService {
    getBinById(id: string): Promise<Bin>;
    createBin(bin: Bin): Promise<Bin>;
    getAllBins(): Promise<Bin[]>;
    updateBin(id: string, bin: Bin): Promise<Bin>;
    deleteBin(id: string): Promise<void>;
}

export {
    Bin,
    IBinService
};