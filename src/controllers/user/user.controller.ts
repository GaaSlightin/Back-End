import { Request, Response, NextFunction } from "express";
import { IUser } from "../../interfaces/auth.interfaces";
import User from "../../models/user.model";

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
   try {
     const user = req.user as IUser;
 
     if (!user) {
       res.status(401).json({
         status: "fail",
         message: "User not authorized",
       });
       return;
     }
 
     // Fetch the user's profile from the database
     const userProfile = await User.findById(user._id).select("-refreshToken -githubAccessToken"); // Exclude sensitive fields
 
     if (!userProfile) {
       res.status(404).json({
         status: "fail",
         message: "User profile not found",
       });
       return;
     }
 
     res.status(200).json({
       status: "success",
       data: userProfile,
     });
   } catch (error: any) {
     console.error("Error fetching user profile", error);
     next(error);
   }
 };