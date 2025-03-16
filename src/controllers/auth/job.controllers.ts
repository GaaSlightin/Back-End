import { NextFunction, Request, Response } from "express";
import JobModel from "../../models/job.model";
import DescriptionModel from "../../models/description.model";
import { IJob, IDescription } from "../../interfaces/job.interfaces";

export const JobController = {
  createJob: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        title,
        company,
        location,
        posting_date,
        archive_date,
        source,
        url,
        skills,
      } = req.body;
      if (
        !title ||
        !company ||
        !location ||
        !posting_date ||
        !archive_date ||
        !source ||
        !url
      ) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const newJob = new JobModel({
        title,
        company,
        location,
        posting_date: new Date(posting_date),
        archive_date: new Date(archive_date),
        source,
        url,
        skills: skills || [],
      });
      await newJob.save();

      const newDescription = new DescriptionModel({
        jobId: newJob._id,
        fullText: req.body.fullText,
        summary: req.body.summary || "AI-generated summary placeholder",
      });
      await newDescription.save();

      res
        .status(201)
        .json({ message: "Job and description created successfully" });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
  getJobById: async (req: Request, res: Response) => {
    try {
      const job = await JobModel.findById(req.params.jobId).exec();
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      const descriprion = await DescriptionModel.findOne({
        jobId: job._id,
      }).exec();
      if (!descriprion) {
        return res.status(404).json({ message: "Description not found" });
      }
      res.status(200).json({ job, descriprion });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
  deleteJob: async (req: Request, res: Response) => {
    try {
      const job = await JobModel.findById(req.params.jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      await DescriptionModel.deleteOne({ jobId: job._id }).exec();
      await JobModel.deleteOne({ _id: job._id }).exec();

      res.status(200).json({ message: "Job deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
};
