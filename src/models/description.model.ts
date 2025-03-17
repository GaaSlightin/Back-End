import mongoose, { Schema } from "mongoose";
import { IDescription, Description } from "../interfaces/job.interfaces";

const descriptionSchema = new Schema<IDescription>(
  {
    jobId: { type: String, required: true, index: true },
    fullText: { type: String },
    summary: { type: String },
  },
  { timestamps: true }
);

const DescriptionModel = mongoose.model<IDescription>(
  "Description",
  descriptionSchema
);

export default DescriptionModel;
