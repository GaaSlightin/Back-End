import express from "express";
import {
  DisplayUserRepoNames,
  GenerateCodeComplexity,
  GeneratePost,
  returnRanks,
} from "../controllers/github/github.controller";
import { EnsureLoggedIn } from "../middleware/ensure-login.middleware"; // Import the EnsureLoggedIn middleware
import { PostContent } from "../controllers/post/post.controller";

const githubRouter = express.Router();

githubRouter.get("/repos", EnsureLoggedIn, DisplayUserRepoNames);
githubRouter.get("/:repo/complexity", EnsureLoggedIn, GenerateCodeComplexity); // Protect the route with EnsureLoggedIn middleware
githubRouter.get("/:repo/post", EnsureLoggedIn, PostContent); // Protect the route with EnsureLoggedIn middleware
githubRouter.get("/repo/rank", EnsureLoggedIn, returnRanks); // Protect the route with EnsureLoggedIn middleware

export default githubRouter;
