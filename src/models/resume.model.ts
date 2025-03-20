import mongoose, { Schema } from "mongoose";
import { IResume } from "../interfaces/resume.interfaces";

const resumeSchema = new Schema<IResume>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    link: { type: String, required: true },
  },
  { timestamps: true }
);

const ResumeModel = mongoose.model<IResume>("Resume", resumeSchema);

export default ResumeModel;
