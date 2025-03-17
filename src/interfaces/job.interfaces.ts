import { Document } from "mongoose";

export interface Skill{
  id?:string;
  name: string;
  category?: string
}
export interface Job {
  jobId: string;
  title: string;
  company: string;
  location: string;
  posting_date: Date;
  archive_date: Date;
  skills: Skill[]
  source: string;
  url: string;
}

export interface IJob extends Job, Document {}

export interface Description {
  descriptionId: string;
  jobId: string;
  fullText: string;
  summary?: string;
}

export interface IDescription extends Description, Document {}
