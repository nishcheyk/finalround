import mongoose, { Document, Schema, Types } from "mongoose";
import { IUser } from "../users/user.schema";
import { IServiceDocument } from "../services/service.schema";

export interface IStaffUser {
  user?: IUser | Types.ObjectId;
}

export interface IAppointment {
  user: Types.ObjectId | IUser;
  staff: Types.ObjectId | IStaffUser;
  service: Types.ObjectId | IServiceDocument;
  startTime: Date;
  endTime: Date;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  notes?: string;
}

export interface IAppointmentDocument extends IAppointment, Document {}

/* This code snippet is defining a Mongoose schema for the `Appointment` model in a TypeScript
environment. Let's break down what each part of the schema is doing: */
const AppointmentSchema: Schema<IAppointmentDocument> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    staff: { type: Schema.Types.ObjectId, ref: "Staff", required: true },
    service: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "no-show"],
      default: "scheduled",
    },
    notes: { type: String },
  },
  { timestamps: true }
);

AppointmentSchema.index({ staff: 1, startTime: 1 }, { unique: true });

/* This line of code is exporting a Mongoose model for the `Appointment` collection in the MongoDB
database. */
export default mongoose.model<IAppointmentDocument>(
  "Appointment",
  AppointmentSchema
);
