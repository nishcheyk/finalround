import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: "user" | "admin" | "staff";
  refreshTokens?: string[];
  isAdmin: boolean; // For compatibility with existing auth middleware
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false }, // Hide by default
    phone: { type: String, required: true },
    role: { type: String, enum: ["user", "admin", "staff"], default: "user" },
    refreshTokens: [{ type: String }],
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

// Virtual for isAdmin for backwards compatibility with existing middleware
UserSchema.virtual("isAdmin").get(function () {
  return this.role === "admin";
});

export default mongoose.model<IUser>("User", UserSchema);
