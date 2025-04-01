import mongoose, { Document, Schema } from 'mongoose';

export interface ITrashBin extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  location: string;
  capacity: number;
  currentLevel: number;
  threshold: number;
  isFull: boolean;
  lastUpdated: Date;
}

const TrashBinSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  capacity: { type: Number, default: 100 }, // Measured in liters or any unit
  currentLevel: { type: Number, default: 0 },
  threshold: { type: Number, default: 80 }, // Percentage threshold to mark as "full"
  isFull: { type: Boolean, default: false },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

TrashBinSchema.pre<ITrashBin>('save', function(this: ITrashBin, next) {
  this.isFull = (this.currentLevel / this.capacity) * 100 >= this.threshold;
  this.lastUpdated = new Date();
  next();
});

export default mongoose.model<ITrashBin>('TrashBin', TrashBinSchema);
