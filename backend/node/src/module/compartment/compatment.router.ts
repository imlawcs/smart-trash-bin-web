import compartmentController from "./compartment.controller";
import { Router } from "express";

const compartmentRouter = Router();

compartmentRouter.get("/:id", compartmentController.getCompartmentById);
compartmentRouter.post("/", compartmentController.setCompartmentStatus);
compartmentRouter.get("/sensor/:sensorId", compartmentController.getCompartmentBySensorId);
compartmentRouter.get("/status/:id", compartmentController.getCompartmentStatus);

export default compartmentRouter;