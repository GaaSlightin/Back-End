import mongoose, { Schema } from "mongoose";
import { IDescription } from "../interfaces/job.interfaces";

const descriptionSchema = new Schema<IDescription>(
  {
    jobId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    url: { type: String, required: true },
    location: { type: String, required: true },
    fullText: { type: String, required: true },
    posting_date: { type: Date, required: true },
    skills: { type: [], default: [] },
  },
  { timestamps: true }
);

const DescriptionModel = mongoose.model<IDescription>(
  "Description",
  descriptionSchema
);

export default DescriptionModel;
