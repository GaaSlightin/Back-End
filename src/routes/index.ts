import { Router } from "express";
import authRouter from "./auth.router";
import githubRouter from "./github.router";
import jobRouter from "./job.routes";
import userRouter from "./user.router";
import postsRouter from "./posts.router";
import resumeRouter from "./resume.router";

const router = Router();

router.use("/auth", authRouter);
router.use("/github", githubRouter);
router.use("/jobs", jobRouter);
router.use("/posts", postsRouter);
router.use("/resume", resumeRouter);
router.use("/", userRouter);

export default router;
