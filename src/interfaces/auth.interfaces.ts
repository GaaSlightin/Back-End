import { Request } from "express";
import { Document } from "mongoose";
import { Profile as PassportProfile } from "passport-github";
import { IRepoDetails } from "./github.interface";

export interface Profile {
   _id: string;
   emails?: { value: string }[];
   username?: string;
   displayName: string;
   provider: string;
   photos?: { value: string }[];
   refreshToken?: string;
   accessToken:string;
   //repositories:string[]
}

export interface IUser extends Document {
  _id: string; // the id will become the result of random uuid coming from crypto package
  email?: string;
  userName?: string;
  displayName: string;
  profileImage?: string;
  bio?: string;
  company?: string;
  location?: string;
  portfolio?: string;
  repositories?: IRepoDetails[];
  createdAt: Date;
  updatedAt: Date;
  githubAccessToken: string;
}
export interface IAuthRequest extends Request {
  user: IUser;
}
export interface JwtPayload {
  _id: string;
  // Add other properties if needed
}
export interface ExtendedProfile extends PassportProfile {
  accessToken: string;
}
