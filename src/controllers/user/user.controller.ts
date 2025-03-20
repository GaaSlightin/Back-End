import { Request, Response, NextFunction } from "express";
import { IUser } from "../../interfaces/auth.interfaces";
import User from "../../models/user.model";
import { FetchAllUserRepoService, getRepoDetails } from "../../utils/github.utils";
import { IFetchRepoResponse } from "../../interfaces/github.interface";


export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
   try {
     const user = req.user as IUser;
 
     if (!user.userName) {
       res.status(401).json({
         status: "fail",
         message: "User not authorized",
       });
       return;
     }

    const repos = await FetchAllUserRepoService(user.userName, user.githubAccessToken);
    const updatedRepos = await getRepoDetails(<IFetchRepoResponse[]>repos);
    
    const userProfile = await User.findByIdAndUpdate(
      user._id,
      { repositories: updatedRepos},
      { new: true } // This ensures the updated document is returned
    ).select("-refreshToken -githubAccessToken"); // Exclude sensitive fields from the response

     res.status(200).json({
       status: "success",
       data: userProfile,
     });
   } catch (error: any) {
     console.error("Error fetching user profile", error);
     next(error);
   }
 };