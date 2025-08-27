import mongoose, { Document, Schema, model } from "mongoose";

/**
 * User document interface
 */
/* The `export interface IUser extends Document` in the TypeScript code snippet is defining an
interface named `IUser` that extends the `Document` interface provided by Mongoose. This interface
specifies the structure of a user document in the MongoDB database. */
export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  password: string;
  isAdmin: boolean;
  refreshTokens: string[]; // store refresh tokens to enable token revocation
}

/* The `const UserSchema = new Schema<IUser>({ ... });` code snippet is defining a Mongoose schema for
the User model. Here's a breakdown of what each property in the schema is doing: */
const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  refreshTokens: { type: [String], default: [] },
});

// Prevent OverwriteModelError in watch mode
/* The code snippet `if (mongoose.models.User) { delete mongoose.models.User; }` is a precautionary
measure to prevent an `OverwriteModelError` that can occur in watch mode when using Mongoose models. */
if (mongoose.models.User) {
  delete mongoose.models.User;
}

const User = model<IUser>("User", UserSchema);

export default User;
