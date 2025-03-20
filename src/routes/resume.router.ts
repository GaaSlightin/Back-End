import router from "express";
import { EnsureLoggedIn } from "../middleware/ensure-login.middleware";
import {
  getResumeById,
  uploadResumeLink,
  getAllResumes,
} from "../controllers/resume/resume.controller";

const resumeRouter = router.Router();

resumeRouter
  .route("/")
  .get(EnsureLoggedIn, getAllResumes)
  .post(EnsureLoggedIn, uploadResumeLink);

resumeRouter
  .route("/:id")
  .get(EnsureLoggedIn, getResumeById)
  .patch(EnsureLoggedIn, getResumeById);

export default resumeRouter;
