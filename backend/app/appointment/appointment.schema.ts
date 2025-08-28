import mongoose, { Schema, Document } from "mongoose";

export interface IAppointment extends Document {
  user: mongoose.Types.ObjectId;
  staff: mongoose.Types.ObjectId;
  service: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  notes?: string;
}

const AppointmentSchema: Schema = new Schema(
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

// Prevent double booking a staff member for the same time slot
AppointmentSchema.index({ staff: 1, startTime: 1 }, { unique: true });

export default mongoose.model<IAppointment>("Appointment", AppointmentSchema);
