
import { Router } from "express";
import authRouter from "./auth.router";
import githubRouter from "./github.router";
import jobRouter from "./job.routes";


const router = Router();

router.use("/auth", authRouter)
router.use("/github",githubRouter)
router.use("/jobs", jobRouter);

export default router;
