
import express from "express";
import { FetchUserRepo } from "../controllers/github/github.controller";

const githubRouter = express.Router();

githubRouter.get("/:handler/repos",FetchUserRepo)

export default githubRouter;