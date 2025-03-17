
import express from "express";
import { FetchUserRepo,ShowRepoTree } from "../controllers/github/github.controller";
import { EnsureLoggedIn } from "../middleware/ensure-login.middleware";

const githubRouter = express.Router();

githubRouter.get("/:handler/repos",FetchUserRepo)
githubRouter.get("/:owner/:repo/tree", EnsureLoggedIn, ShowRepoTree); 

export default githubRouter;