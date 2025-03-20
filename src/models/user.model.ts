import mongoose, { Schema } from "mongoose";
import { IUser } from "../interfaces/auth.interfaces";
import { randomUUID } from "crypto";

const RepoDetailsSchema = new Schema(
  {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    about: { type: String },
    stars: { type: Number, required: true },
    forks: { type: Number, required: true },
    topics: { type: [String], required: true },
  },
  { _id: false } // Prevents creating a separate _id for each repository
);

const UserSchema = new Schema<IUser>(
  {
    _id: { type: String, required: true, default: randomUUID }, // create a uuid for each new user
    email: { type: String, unique: true, sparse: true }, // Some users might not have emails
    userName: { type: String, unique: true, sparse: true },
    displayName: { type: String },
    profileImage: { type: String },
    bio: { type: String },
    company: { type: String },
    location: { type: String },
    portfolio: { type: String },
    repositories: { type: [RepoDetailsSchema], default: [] },
    githubAccessToken:{type:String}
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
