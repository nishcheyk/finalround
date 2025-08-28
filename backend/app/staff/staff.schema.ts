import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "../users/user.schema";

// This defines the structure for a staff member's weekly availability
export interface IAvailabilitySlot {
  dayOfWeek: number; // 0 (Sun) to 6 (Sat)
  startTime: string; // "HH:mm" format, e.g., "09:00"
  endTime: string; // "HH:mm" format, e.g., "17:00"
}

export interface IStaff extends Document {
  user: IUser["_id"];
  services: mongoose.Types.ObjectId[];
  availability: IAvailabilitySlot[];
}

const StaffSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    services: [{ type: Schema.Types.ObjectId, ref: "Service" }],
    availability: [
      {
        dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
        startTime: {
          type: String,
          required: true,
          match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        },
        endTime: {
          type: String,
          required: true,
          match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IStaff>("Staff", StaffSchema);
