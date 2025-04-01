import mongoose from "mongoose";

const TrashSchema = new mongoose.Schema({
    binId: { type: String, required: true, unique: true }, // Mã định danh thùng rác
    level: { type: Number, required: true }, // Mức rác (%)
    updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Trash", TrashSchema);
