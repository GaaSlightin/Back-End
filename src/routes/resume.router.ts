import router from "express";
import { EnsureLoggedIn } from "../middleware/ensure-login.middleware";
import {
  getResumeById,
  uploadResumeLink,
  getAllResumes,
} from "../controllers/resume/resume.controller";
import { get } from "http";

const resumeRouter = router.Router();

resumeRouter.get("/", EnsureLoggedIn, getAllResumes);
resumeRouter.post("/", EnsureLoggedIn, uploadResumeLink);
resumeRouter.get("/:id", EnsureLoggedIn, getResumeById);

export default resumeRouter;
