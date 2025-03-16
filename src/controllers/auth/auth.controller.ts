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

    let existingUser = await User.findOne({ _id: profile.id });

    if (!existingUser) {
      const newUser = new User({
        _id: profile.id,
        email: profile.emails ? profile.emails[0].value : undefined,
        userName: profile.username,
        displayName: profile.displayName,
        profileImage: profile.photos ? profile.photos[0].value : undefined,
        authProvider: profile.provider,
        refreshToken: generateRefreshToken(profile.id),
      });

      await newUser.save();
      existingUser = newUser;
    }

    const accessToken = generateAccessToken(existingUser._id);
    const refreshToken = generateRefreshToken(existingUser._id);

    res.json({
      accessToken,
      refreshToken,
      user: existingUser,
    });
  } catch (error: any) {
    console.error("Error in authentication", error);
    next(error);
  }
};