import mongoose, { Schema, Document } from "mongoose";
import { IRepository } from "../interfaces/github.interface";


const RepositorySchema = new Schema<IRepository>(
  {
    userId: { type: String, required: true }, // User ID
    name: { type: String, required: true }, // Repository name
    codeComplexity:{type:Number,required:true}
  },
  { timestamps: true }
);

export default mongoose.model<IRepository>("Repository", RepositorySchema);