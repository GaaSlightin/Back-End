import express from "express";
import { FetchUserRepo, ShowRepoTree } from "../controllers/github/github.controller";
import { EnsureLoggedIn } from "../middleware/ensure-login.middleware"; // Import the EnsureLoggedIn middleware

const githubRouter = express.Router();

githubRouter.get("/:handler/repos", FetchUserRepo);
githubRouter.get("/:owner/:repo/tree", EnsureLoggedIn, ShowRepoTree); // Protect the route with EnsureLoggedIn middleware

export default githubRouter;