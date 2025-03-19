import { Request, Response, NextFunction } from "express";
import User from "../../models/user.model";
import { generateAccessToken, generateRefreshToken } from "../../utils/auth.utils";
import { Profile } from "../../interfaces/auth.interfaces";
import dotenv from "dotenv"

dotenv.config()

export const getAccessToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        
        const code = req.query.code as string;

        const params = "?client_id=" + process.env.GITHUB_CLIENT_ID + "&client_secret=" + process.env.GITHUB_CLIENT_SECRET + "&code=" + code;

        const response = await fetch("https://github.com/login/oauth/access_token" + params, {
            method: "POST",
            headers: {
                "Accept": "application/json"
            }
        });

        const data = await response.json();
        const githubAccessToken = data.access_token;
        console.log(githubAccessToken);

        let existingUser = await User.findOne({ githubAccessToken});
    
        if (!existingUser) {
            const response = await fetch("https://api.github.com/user", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${githubAccessToken}`
                }
            });

            const data = await response.json();
            console.log(data);        
            
            // const profile: Profile = {
            //     _id: data.id,
            //     username: data.login,
            //     displayName: data.name,
            //     emails: [{ value: data.email }],
            //     photos: [{ value: data.avatar_url }],
            //     accessToken: githubAccessToken,
            //     provider: "github"
            // };

            // existingUser = await User.create({
            // email: profile.emails?.[0]?.value,
            // userName: profile.username,
            // displayName: profile.displayName,
            // profileImage: profile.photos?.[0]?.value,
            // githubAccessToken: profile.accessToken
        //   });
        // } else {
        //   existingUser.githubAccessToken = profile.accessToken; // Update the access token if the user already exists
        //   await existingUser.save();
        // }
        // const refreshToken = generateRefreshToken(existingUser._id);
        // existingUser.refreshToken = refreshToken;
        // await existingUser.save();

        // const token = generateAccessToken(existingUser._id);
        }
        res.status(200).json({ githubAccessToken });
    } catch (error: any) {
    console.error("Error in authentication", error);
    next(error);
  }
};
