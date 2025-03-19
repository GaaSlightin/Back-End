import "../configs/passport-github.configs";
import express, { RequestHandler } from "express";
// import passport from "passport";
import { getAuthorizedViaGithub } from "../controllers/auth/auth.controller";
import dotenv from "dotenv"
dotenv.config()

const authRouter = express.Router();

// authRouter.get("/github", passport.authenticate("github"));
// authRouter.get("/github/callback", passport.authenticate('github', { failureRedirect: `${process.env.FRONTEND_URL}/auth-failure` }), handleGithubAuth);
// authRouter.get("/failure", (req, res) => {
//    res.status(401).json({
//      status: "fail",
//      message: "GitHub authentication failed. Please try again.",
//    });
//  });

/*authRouter.get("/github", (req, res) => {
   const clientId = process.env.GITHUB_CLIENT_ID;
   const redirectUri = `${process.env.BACKEND_URL}/api/v0/auth/github/callback`; // Replace with your backend URL
   const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:user`;
 
   // Redirect the user to GitHub's authorization URL
   res.redirect(githubAuthUrl);
 });*/
authRouter.get("/github/callback", getAuthorizedViaGithub);

export default authRouter;