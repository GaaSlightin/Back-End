import { Request, Response, NextFunction } from "express";
import JobModel from "../../models/job.model";
import DescriptionModel from "../../models/description.model";
import { IAuthRequest } from "../../interfaces/auth.interfaces";

export class JobController {
  public static getAllJobs = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = (req as IAuthRequest).user._id;
      const jobs = await JobModel.find({ userId });
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
      const userId = (req as IAuthRequest).user._id;
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
        userId,
      });
      const savedJob = await newJob.save();

      const newDescription = new DescriptionModel({
        jobId: savedJob._id,
        userId,
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
      const userId = (req as IAuthRequest).user._id;
      const jobId = req.params.jobId;
      const job = await JobModel.findById({ _id: jobId, userId });
      if (!job) return res.status(404).json({ message: "Job not found" });

      const description = await DescriptionModel.findOne({
        jobId: job._id,
        userId,
      });
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
      const userId = (req as IAuthRequest).user._id;
      const jobId = req.params.jobId;
      const updatedJob = await JobModel.findByIdAndUpdate(
        { _id: jobId, userId },
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
      const userId = (req as IAuthRequest).user._id;
      const jobId = req.params.jobId;
      const job = await JobModel.findByIdAndDelete({ _id: jobId, userId });
      if (!job) return res.status(404).json({ message: "Job not found" });

      await DescriptionModel.deleteOne({ jobId, userId });

      res.status(200).json({ message: "Job deleted successfully" });
    } catch (error) {
      next(error);
    }
  };
}
