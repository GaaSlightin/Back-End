import { Request, Response, NextFunction } from "express";
import JobModel from "../../models/job.model";
import DescriptionModel from "../../models/description.model";

export class JobController {
  public static getAllJobs = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const jobs = await JobModel.find();
      res.status(200).json(jobs);
    } catch (error) {
      next(error);
    }
  };

  public static createJob = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
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
        fullText,
        summary,
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
        posting_date,
        archive_date,
        source,
        url,
        skills,
      });
      const savedJob = await newJob.save();

      const newDescription = new DescriptionModel({
        jobId: savedJob._id,
        fullText,
        summary,
      });
      const savedDesc = await newDescription.save();

      res.status(201).json({ job: savedJob, description: savedDesc });
    } catch (error) {
      next(error);
    }
  };

  public static getJobById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const job = await JobModel.findById(req.params.jobId);
      if (!job) return res.status(404).json({ message: "Job not found" });

      const description = await DescriptionModel.findOne({ jobId: job._id });
      res.status(200).json({ job, description });
    } catch (error) {
      next(error);
    }
  };

  public static updateJob = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const updatedJob = await JobModel.findByIdAndUpdate(
        req.params.jobId,
        req.body,
        { new: true }
      );
      if (!updatedJob)
        return res.status(404).json({ message: "Job not found" });

      res.status(200).json(updatedJob);
    } catch (error) {
      next(error);
    }
  };

  public static deleteJob = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const job = await JobModel.findByIdAndDelete(req.params.jobId);
      if (!job) return res.status(404).json({ message: "Job not found" });

      await DescriptionModel.deleteOne({ jobId: req.params.jobId });

      res.status(200).json({ message: "Job deleted successfully" });
    } catch (error) {
      next(error);
    }
  };
}
