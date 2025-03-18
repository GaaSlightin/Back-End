import { Router } from "express";
import { JobController } from "../controllers/job/job.controller";
import { asyncHandler } from "../utils/asyncHandler.util";
import { EnsureLoggedIn } from "../middleware/ensure-login.middleware";

const router = Router();

router.use(asyncHandler(EnsureLoggedIn));

router
  .route("/")
  .post(asyncHandler(JobController.createJob))
  .get(asyncHandler(JobController.getAllJobs));

router
  .route("/:jobId")
  .get(asyncHandler(JobController.getJobById))
  .put(asyncHandler(JobController.updateJob))
  .delete(asyncHandler(JobController.deleteJob));

router.get(
  "/:jobId/description",
  asyncHandler(JobController.getJobDescription)
);

export default router;