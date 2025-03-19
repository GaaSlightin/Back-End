import mongoose, { Schema } from "mongoose";
import { IUser } from "../interfaces/auth.interfaces";
import { randomUUID } from "crypto";

const UserSchema = new Schema<IUser>(
  {
    _id: { type: String, required: true, default: randomUUID }, // create a uuid for each new user
    email: { type: String, unique: true, sparse: true }, // Some users might not have emails
    userName: { type: String, unique: true, sparse: true }, // Optional username
    displayName: { type: String }, // Display name from OAuth
    profileImage: { type: String }, // Profile picture URL
    githubAccessToken:{type:String}
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
