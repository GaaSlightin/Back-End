import { Request, Response, NextFunction } from "express";
import JobModel from "../../models/job.model";
import DescriptionModel from "../../models/description.model";
import { IAuthRequest } from "../../interfaces/auth.interfaces";
import {
  generateSummary,
  extractJobDataFromUrl,
} from "../../utils/mistralClient";
import { Job, Description } from "../../interfaces/job.interfaces";
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
      if (url && /^https?:\/\/[^\s$.?#].[^\s]*$/.test(url)) {
        const { job, description } = await extractJobDataFromUrl(url);

        const generatedSummary = await generateSummary(description.fullText);

        const newDescription = new DescriptionModel({
          ...description,
          jobId: "",
          userId,
          fullText: description.fullText,
          summary: generatedSummary || "",
        } as Partial<Description>);

        const savedDescription = await newDescription.save();

        const newJob: any = new JobModel({
          ...job,
          userId,
          descriptionId: savedDescription._id,
          jobId: undefined,
          archive_date: new Date(job.archive_date || new Date(0)),
        } as Partial<Job>);

        savedDescription.jobId = newJob._id.toString();
        await savedDescription.save();

        const savedJob = await newJob.save();
        res.status(201).json({ job: savedJob, description: savedDescription });
      } else {
        res.status(400).json({ message: "Invalid URL" });
      }
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
