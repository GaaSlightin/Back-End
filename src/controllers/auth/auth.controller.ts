import { Request, Response, NextFunction } from "express";
import User from "../../models/user.model";
import { generateAccessToken, generateRefreshToken } from "../../utils/auth.utils";
import { Profile } from "../../interfaces/auth.interfaces";
import dotenv from "dotenv"
dotenv.config()

export const handleGithubAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = req.user as Profile;
    if (!profile) {
      res.status(400).send("Profile is undefined");
      return;
    }
    console.log("access token coming from oAuth", profile.accessToken);
    let existingUser = await User.findOne({ userName: profile.username });
    console.log(profile.username);
    if (!existingUser) {
      existingUser = await User.create({
        email: profile.emails?.[0]?.value,
        userName: profile.username,
        displayName: profile.displayName,
        profileImage: profile.photos?.[0]?.value,
        githubAccessToken: profile.accessToken // Store the access token
      });
    } else {
      existingUser.githubAccessToken = profile.accessToken; // Update the access token if the user already exists
      await existingUser.save();
    }
    const refreshToken = generateRefreshToken(existingUser._id);
    existingUser.refreshToken = refreshToken;
    await existingUser.save();

    const token = generateAccessToken(existingUser._id);
       // Set the access token and refresh token as HTTP-only cookies
       res.cookie("accessToken", token, {
        httpOnly: false,
        secure: false,//process.env.NODE_ENV === "production", // Use secure cookies in production
        sameSite: "none",
      });
      /*res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,//process.env.NODE_ENV === "production",
        sameSite: "strict",
      });*/
  
      // Redirect to the home page
      res.redirect(`${process.env.FRONTEND_URL}/profile`);
  } catch (error: any) {
    console.error("Error in authentication", error);
    next(error);
  }
};
