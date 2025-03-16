import { Request, Response, NextFunction } from "express";
import User from "../../models/user.model";
import { generateAccessToken, generateRefreshToken } from "../../utils/auth.utils";
import { Profile } from "../../interfaces/auth.interfaces";

export const handleGithubAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = req.user as Profile;
    if (!profile) {
       res.status(400).send("Profile is undefined");
       return;
    }
    let existingUser = await User.findOne({ userName: profile.username });
    console.log(profile.username);
    if (!existingUser) {
       existingUser = await User.create({
          email: profile.emails?.[0]?.value,
          userName: profile.username,
          displayName:profile.displayName,
          profileImage: profile.photos?.[0]?.value,
       });
    }
    const refreshToken = generateRefreshToken(existingUser._id);
    existingUser.refreshToken = refreshToken;
    await existingUser.save();

    const token = generateAccessToken(existingUser._id);
    res.status(201).json({
       message: "success",
       data: { 
          accessToken: token ,
          refreshToken:refreshToken,
       }
    });
 } catch (error: any) {
    console.error("Error in authentication", error);
    next(error);
 }
};