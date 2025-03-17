import mongoose, { Schema } from "mongoose";
import { IDescription, Description, Skill } from "../interfaces/job.interfaces";

const skillSchema = new Schema<Skill>({
  name: { type: String, required: true },
  category: { type: String },
});

const descriptionSchema = new Schema<IDescription>(
  {
    jobId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    url: { type: String, required: true },
    location: { type: String, required: true },
    fullText: { type: String, required: true },
    summary: { type: String },
    posting_date: { type: Date, required: true },
    skills: { type: [skillSchema], default: [] },
  },
  { timestamps: true }
);

const DescriptionModel = mongoose.model<IDescription>(
  "Description",
  descriptionSchema
);

export default DescriptionModel;
