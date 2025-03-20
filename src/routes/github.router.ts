import express from "express";
import { DisplayUserRepoNames, GenerateCodeComplexity } from "../controllers/github/github.controller";
import { EnsureLoggedIn } from "../middleware/ensure-login.middleware"; // Import the EnsureLoggedIn middleware
import { asyncHandler } from "../utils/asyncHandler.util";

const githubRouter = express.Router();

githubRouter.get("/repos", EnsureLoggedIn,DisplayUserRepoNames);
githubRouter.get("/:repo/complexity", EnsureLoggedIn, asyncHandler(GenerateCodeComplexity)); // Protect the route with EnsureLoggedIn middleware

export default githubRouter;