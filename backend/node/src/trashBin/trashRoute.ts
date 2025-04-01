import { Router } from 'express';
// import { protect } from '../middlewares/authMiddleware';
// import { 
//   getAllTrashBins, 
//   getTrashBin, 
//   createTrashBin, 
//   updateTrashBin, 
//   deleteTrashBin 
// } from '../controllers/trashBinController';
import express from "express";
import Trash from "../models/Trash";


const router = Router();

// All routes are protected
// router.use(protect);

// router.route('/')
//   .get(getAllTrashBins)
//   .post(createTrashBin);

// router.route('/:id')
//   .get(getTrashBin)
//   .put(updateTrashBin)
//   .delete(deleteTrashBin);

// Lấy danh sách thùng rác
router.get("/", async (req, res) => {
    try {
        const trashBins = await Trash.find();
        res.json(trashBins);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
