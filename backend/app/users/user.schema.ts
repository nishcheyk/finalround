import mongoose, { Document, Schema, model } from "mongoose";

/**
 * User document interface
 */
export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  password: string;
  isAdmin: boolean;
  refreshTokens: string[]; // store refresh tokens to enable token revocation
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  refreshTokens: { type: [String], default: [] },
});

// Prevent OverwriteModelError in watch mode
if (mongoose.models.User) {
  delete mongoose.models.User;
}

const User = model<IUser>("User", UserSchema);

export default User;
