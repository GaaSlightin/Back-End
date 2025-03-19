import "../configs/passport-github.configs";
import express, { RequestHandler } from "express";
// import passport from "passport";
import { getAuthorizedViaGithub } from "../controllers/auth/auth.controller";
import dotenv from "dotenv"
dotenv.config()

const authRouter = express.Router();

authRouter.get("/github", getAuthorizedViaGithub);

export default authRouter;