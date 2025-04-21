import mongoose, { Schema, model, InferSchemaType } from 'mongoose';
import CompartmentSchema from './CompartmentSchema';

const binSchema = new Schema({
  name: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  // compartments: [CompartmentSchema],
});

type BinType = InferSchemaType<typeof binSchema>;
export default model<BinType>('Bin', binSchema);
