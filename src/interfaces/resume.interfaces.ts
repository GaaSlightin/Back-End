import Document from "mongoose";

export interface IResume {
  userId: string;
  title: string;
  link: string;
}

export interface IResumeDocument extends IResume, Document {}
