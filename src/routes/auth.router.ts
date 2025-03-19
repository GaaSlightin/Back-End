import "../configs/passport-github.configs";
import express, { RequestHandler } from "express";
import passport from "passport";
import {handleGithubAuth } from "../controllers/auth/auth.controller";
import dotenv from "dotenv"
import { EnsureLoggedIn } from "../middleware/ensure-login.middleware";
dotenv.config()

const authRouter = express.Router();

authRouter.get("/github", passport.authenticate("github"));
authRouter.get("/github/callback", passport.authenticate('github', { failureRedirect: `${process.env.FRONTEND_URL}/auth-failure` }), handleGithubAuth);
authRouter.get("/failure", (req, res) => {
   res.status(401).json({
     status: "fail",
     message: "GitHub authentication failed. Please try again.",
   });
 });
 

export default authRouter;