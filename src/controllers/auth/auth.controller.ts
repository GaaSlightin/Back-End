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

    // const cookieOptions = {
    //   httpOnly: true,  // Prevent JavaScript access
    //   secure: process.env.NODE_ENV === "production", // Secure in production
    //   sameSite: process.env.NODE_ENV === "production" ? "none" as "none" : "lax" as "lax", // Adjust based on env
    //   path: "/"
    // };

  // const cookieOptions = {
  //   httpOnly: true,
  //   secure: true,  // Must be true for cross-domain cookies
  //   sameSite: "none" as "none",  // Must be "none" for cross-domain
  //   path: "/"
  // };

    // const token = generateAccessToken(existingUser._id);
    //    res.cookie("accessToken", token, {
    //     ...cookieOptions,
    //     maxAge: 7 * 24 * 60 * 60 * 1000 
    //   });
    //   console.log("Set cookies:", {
    //     access_token: token,
    //     refresh_token: refreshToken
    //   });
  
    const token = generateAccessToken(existingUser._id);

    // Removed cookie setting logic and replaced with JSON response
    // console.log("Returning tokens:", {
    //   access_token: token,
    //   refresh_token: refreshToken
    // });
  
      // Redirect to the home page
      // res.redirect(`${process.env.FRONTEND_URL}/profile`);


      // Instead of redirecting, return JSON with tokens and redirect URL
    res.status(200).json({
      access_token: token,
      refresh_token: refreshToken,
      redirect_url: `${process.env.FRONTEND_URL}/profile`,
      user: {
        id: existingUser._id,
        username: existingUser.userName,
        displayName: existingUser.displayName,
        profileImage: existingUser.profileImage,
        email: existingUser.email
      }
    });

  } catch (error: any) {
    console.error("Error in authentication", error);
    next(error);
  }
};
