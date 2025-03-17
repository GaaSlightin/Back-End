import { Router } from "express";
import { JobController } from "../controllers/job/job.controller";
import { asyncHandler } from "../utils/asyncHandler.util";
import { authMiddleware } from "../middleware/auth.middleware";
const router = Router();

router.use(asyncHandler(authMiddleware));

router.post("/", asyncHandler(JobController.createJob));
router.get("/", asyncHandler(JobController.getAllJobs));
router.get("/:id", asyncHandler(JobController.getJobById));
router.put("/:id", asyncHandler(JobController.updateJob));
router.delete("/:id", asyncHandler(JobController.deleteJob));

export default router;
