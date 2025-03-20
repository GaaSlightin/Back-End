import { NextFunction, Request, Response } from "express";
import { IAuthRequest } from "../../interfaces/auth.interfaces";
import ResumeModel from "../../models/resume.model";
import app from "../../../api/index";
import { randomUUID } from "crypto";

export const getAllResumes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as IAuthRequest).user._id;
    const resumes = await ResumeModel.find({ userId });
    res.status(200).json(resumes);
  } catch (error) {
    next(error);
  }
};

export const uploadResumeLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as IAuthRequest).user._id;
    const { title, link } = req.body;

    const newResume = new ResumeModel({
      userId,
      title,
      link,
    });
    if (!title || !link) {
      res.status(400).json({
        status: "fail",
        message: "Title and Link are required",
      });
      return;
    }

    const resume = await newResume.save();
    res.status(201).json(resume);
  } catch (error) {
    next(error);
  }
};

export const getResumeById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as IAuthRequest).user._id;
    if (!userId) res.status(400).json({ message: "User not authorized" });

    const resumeId = req.params.id;
    const resume = await ResumeModel.findOne({ userId, _id: resumeId }).lean();
    if (!resume) {
      res.status(404).json({
        status: "fail",
        message: "Resume not found",
      });
      return;
    }
    res.status(200).json(resume);
  } catch (error) {
    next(error);
  }
};
