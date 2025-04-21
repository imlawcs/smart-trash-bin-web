import mongoose, { Schema, model, InferSchemaType } from 'mongoose';

const compartmentSchema = new Schema({
    binId: { type: Schema.Types.ObjectId, ref: 'Bin', required: true }, // Liên kết với Bin
    type: { type: String, enum: ['plastic', 'paper', 'metal', 'trash'], required: true },
    isFull: { type: Boolean, default: false },
    sensorId: { type: String }, // mã thiết bị gắn vào
    updatedAt: { type: Date, default: Date.now }
  });
  
  type CompartmentType = InferSchemaType<typeof compartmentSchema>;
  export default model<CompartmentType>('Compartment', compartmentSchema);
  