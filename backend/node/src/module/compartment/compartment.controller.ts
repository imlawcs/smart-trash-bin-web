import compartmentService from "./compartment.service";

class CompartmentController {
    public async getCompartmentById(req: any, res: any, next: any): Promise<void> {
        const id = req.params.id;
        try {
            const compartment = await compartmentService.getCompartmentById(id);
            res.status(200).json(compartment);
        } catch (error) {
            next(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    public async setCompartmentStatus(req: any, res: any, next: any): Promise<void> {
        const { sensorId, isFull } = req.body;
        try {
            await compartmentService.setCompartmentStatus(sensorId, isFull);
            res.status(200).json({ message: "Compartment status updated successfully" });
        } catch (error) {
            next(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    public async getCompartmentStatus(req: any, res: any, next: any): Promise<void> {
        const id = req.params.id;
        try {
            const status = await compartmentService.getCompartmentStatus(id);
            res.status(200).json({ status });
        } catch (error) {
            next(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    public async getCompartmentBySensorId(req: any, res: any, next: any): Promise<void> {
        const sensorId = req.params.sensorId;
        try {
            const compartment = await compartmentService.getCompartmentBySensorId(sensorId);
            res.status(200).json(compartment);
        } catch (error) {
            next(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

export default new CompartmentController();