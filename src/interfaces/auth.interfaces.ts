import { Request } from "express";
import { Document } from "mongoose";
export interface Profile {
  id: string;
  emails?: { value: string }[];
  username?: string;
  displayName: string;
  provider: string;
  photos?: { value: string }[];
  refreshToken?: string;
}

export interface IUser extends Document {
  _id: string; // the id will become the result of random uuid coming from crypto package
  password?: string;
  email?: string;
  userName?: string;
  displayName: string;
  profileImage?: string;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface IAuthRequest extends Request {
  user: IUser;
}
