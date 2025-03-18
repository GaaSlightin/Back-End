import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user.model"; // Import the User model
import { JwtPayload } from "../interfaces/auth.interfaces";

dotenv.config();

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET as string;

export const EnsureLoggedIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = req.headers.authorization?.split(" ")[1];
    if (!accessToken) {
      res.status(401).json({
        status: "error",
        message: "Access Token is missing"
      });
      return;
    }
    jwt.verify(accessToken, accessTokenSecret, async (err, decoded) => {
      if (err) {
        const message = err.message === "TokenExpiredError" ? "Access Token has Expired" : "Invalid Access Token";
        res.status(401).json({
          status: "error",
          message: message
        });
        return;
      }

      const payload = decoded as JwtPayload; // Cast the decoded payload to JwtPayload
      const user = await User.findById(payload._id); // Fetch the user document
      if (!user) {
        res.status(404).json({
          status: "error",
          message: "User not found"
        });
        return;
      }
      console.log("User from EnsureLogin",user)
      req.user = user; // Attach the user document to the req object
      next();
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};