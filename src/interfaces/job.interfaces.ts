import mongoose, { Document } from "mongoose";

export interface Skill {
  id?: string;
  name: string;
  category?: string;
}
export interface Job {
  userId: string;
  title: string;
  company: string;
  archive_date: Date;
  source: string;
  url: string;
  skills: Skill[];
}

export interface IJob extends Job, Document {}

export interface Description {
  descriptionId?: string;
  jobId: string;
  location: string;
  userId: string;
  posting_date: Date;

  url: string;
  fullText: string;
}

export interface IDescription extends Description, Document {}
