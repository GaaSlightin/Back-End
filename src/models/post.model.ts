import mongoose, { Schema } from "mongoose";
import { IPost } from "../interfaces/github.interface";

const postSchema = new Schema<IPost>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const PostModel = mongoose.model<IPost>("Post", postSchema);
export default PostModel;
