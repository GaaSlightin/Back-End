import mongoose, { Schema } from "mongoose";
import { IJob, Skill } from "../interfaces/job.interfaces";

const skillSchema = new Schema<Skill>({
  name: { type: String, required: true },
  category: { type: String },
});

const jobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    posting_date: { type: Date, required: true },
    archive_date: { type: Date, required: true },
    source: { type: String, required: true },
    url: { type: String, required: true },
    skills: { type: [skillSchema], default: [] },
  },
  { timestamps: true }
);

const JobModel = mongoose.model<IJob>("Job", jobSchema);

export default JobModel;