import { Request, Response, NextFunction } from "express";
import User from "../../models/user.model";
import { generateAccessToken, generateRefreshToken } from "../../utils/auth.utils";
import dotenv from "dotenv"

dotenv.config()

export const getAuthorizedViaGithub = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const code = req.query.code as string;
        const params = "?client_id=" + process.env.GITHUB_CLIENT_ID + "&client_secret=" + process.env.GITHUB_CLIENT_SECRET + "&code=" + code;

        const tokenRes = await fetch("https://github.com/login/oauth/access_token" + params, {
            method: "POST",
            headers: {
                "Accept": "application/json"
            }
        });

        const data = await tokenRes.json();
        const githubAccessToken = data.access_token;

        
        const userRes = await fetch("https://api.github.com/user", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${githubAccessToken}`
            }
        });
        const fetchedUser = await userRes.json();

        let existingUser = await User.findOne({ userName: fetchedUser.login });
    
        if (existingUser === null) {
            console.log("Creating new user");
            existingUser = await User.create({
                email: fetchedUser.emails?.[0]?.value,
                userName: fetchedUser.login,
                displayName: fetchedUser.name,
                profileImage: fetchedUser.avatar_url,
                githubAccessToken
            });
            console.log(existingUser);
        } else {
            console.log("Updating existing user");
            existingUser.githubAccessToken = githubAccessToken;
            await existingUser.save();
        }

        const accessToken = generateAccessToken(existingUser._id);
        res.status(200).json({ accessToken });
    } catch (error: any) {
    console.error("Error in authentication", error);
    next(error);
  }
};
