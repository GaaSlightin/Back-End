import mongoose, { Schema } from "mongoose";
import { IJob } from "../interfaces/job.interfaces";
import { randomUUID } from "crypto";

const jobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    archive_date: { type: Date, required: true },
    source: { type: String, required: true },
    url: { type: String, required: true },
    userId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

const JobModel = mongoose.model<IJob>("Job", jobSchema);

export default JobModel;
