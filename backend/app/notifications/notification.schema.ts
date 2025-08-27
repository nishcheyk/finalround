import mongoose, { Document, Schema, Types } from "mongoose";

export interface INotification extends Document {
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  priority: "low" | "medium" | "high";
  sender: Types.ObjectId;
  recipients: Types.ObjectId[];
  readBy: Array<{
    user: Types.ObjectId;
    readAt: Date;
  }>;
  isGlobal: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    type: {
      type: String,
      enum: ["info", "warning", "error", "success"],
      default: "info",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipients: [{ type: Schema.Types.ObjectId, ref: "User" }],
    readBy: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        readAt: { type: Date, default: Date.now },
      },
    ],
    isGlobal: { type: Boolean, default: false },
    expiresAt: Date,
  },
  { timestamps: true },
);

notificationSchema.index({ recipients: 1, createdAt: -1 });
notificationSchema.index({ sender: 1, createdAt: -1 });
notificationSchema.index({ isGlobal: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 });

notificationSchema.virtual("unreadCount").get(function () {
  if (this.isGlobal) return 0; // calculated in service instead
  return this.recipients.length - this.readBy.length;
});

const NotificationModel = mongoose.model<INotification>(
  "Notification",
  notificationSchema,
);

export default NotificationModel;
