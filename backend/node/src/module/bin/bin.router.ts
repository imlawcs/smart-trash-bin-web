import binController from "./bin.controller";
import { Router } from "express";

const binRouter = Router();

binRouter.get("/", binController.getAllBins);
binRouter.get("/:id", binController.getTrashBinById);
binRouter.post("/", binController.createBin);
binRouter.put("/:id", binController.updateBin);
binRouter.delete("/:id", binController.deleteBin);

export default binRouter;