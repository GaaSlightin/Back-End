import { Document } from "mongoose";
import { Request } from "express";

export interface Job {
  jobId: string;
  title: string;
  company: string;
  location: string;
  posting_date: string;
  archive_date: string;
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

export interface iDescription extends Description, Document {}
