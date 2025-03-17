import { Request, Response, NextFunction } from "express";
import JobModel from "../../models/job.model";
import DescriptionModel from "../../models/description.model";
import { IAuthRequest } from "../../interfaces/auth.interfaces";
import { Job, Description } from "../../interfaces/job.interfaces";
import extractJobData from "../../utils/mistralClient";
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
      const { url } = req.body;

      if (!url || !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(url)) {
        return res.status(400).json({ message: "Invalid URL" });
      }
      const { job, description } = await extractJobData(url);
      console.log(job, description);

      const newJob = new JobModel({
        userId,
        title: job.title,
        company: job.company,
        archive_date: new Date(job.archive_date || new Date()),
        source: job.source || new URL(url).hostname,
        url,
      });

      const savedJob = await newJob.save();

      // Create Description document with the saved jobId
      const newDescription = new DescriptionModel({
        jobId: savedJob._id || "Unknown",
        userId,
        location: description.location || "Unknown",
        posting_date: new Date(description.posting_date || new Date()),
        skills: Array.isArray(description.skills) ? description.skills : [],
        url,
        fullText: description.fullText || "No description available",
        summary: description.summary || "",
      });

      const savedDescription = await newDescription.save();

      res.status(201).json({ job: savedJob, description: savedDescription });
    } catch (error) {
      console.error("Error in createJob:", error);
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
