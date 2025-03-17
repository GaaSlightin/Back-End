
import { Router } from "express";
import authRouter from "./auth.router";
import githubRouter from "./github.router";


const router = Router();

router.use("/auth", authRouter)
router.use("/github",githubRouter)

export default router;
