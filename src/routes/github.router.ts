import express from "express";
import { DisplayUserRepoNames, GenerateCodeComplexity } from "../controllers/github/github.controller";
import { EnsureLoggedIn } from "../middleware/ensure-login.middleware"; // Import the EnsureLoggedIn middleware

const githubRouter = express.Router();

githubRouter.get("/repos", EnsureLoggedIn,DisplayUserRepoNames);
githubRouter.get("/:repo/tree", EnsureLoggedIn, GenerateCodeComplexity); // Protect the route with EnsureLoggedIn middleware

export default githubRouter;