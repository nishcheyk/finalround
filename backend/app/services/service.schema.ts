import mongoose, { Schema, Document } from "mongoose";

export interface IService extends Document {
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
}

const ServiceSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true, min: 5 }, // Minimum 5 minutes duration
    price: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IService>("Service", ServiceSchema);
