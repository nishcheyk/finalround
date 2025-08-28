import { Schema, model, Document, Types } from "mongoose";

export interface IService {
  name: string;
  description: string;
  duration: number;
  price: number;
}

// Document interface including mongoose Document properties
export interface IServiceDocument extends IService, Document {}

const ServiceSchema = new Schema<IServiceDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    duration: { type: Number, required: true, min: 5 },
    price: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export default model<IServiceDocument>("Service", ServiceSchema);
