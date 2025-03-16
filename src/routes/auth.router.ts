import "../configs/passport-github.configs";
import express, { RequestHandler } from "express";
import passport from "passport";
import { handleGithubAuth } from "../controllers/auth/auth.controller";

const authRouter = express.Router();

authRouter.get("/github", passport.authenticate("github"));
authRouter.get("/github/callback", passport.authenticate('github', { failureRedirect: '/failure' }), handleGithubAuth);

export default authRouter;