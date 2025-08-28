import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: "user" | "admin" | "staff";
  refreshTokens?: string[];
  isAdmin: boolean;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true }, // Hide by default
    phone: { type: String, required: true },
    role: { type: String, enum: ["user", "admin", "staff"], default: "user" },
    isAdmin: { type: Boolean, default: false },
    refreshTokens: [{ type: String }],
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre<IUser>("save", async function (next) {
  // Sync isAdmin with role whenever role is modified
  if (this.isModified("role")) {
    this.isAdmin = this.role === "admin";
  }

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

export default mongoose.model<IUser>("User", UserSchema);
