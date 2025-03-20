import router from "express";
import { EnsureLoggedIn } from "../middleware/ensure-login.middleware";
import {
  getPostById,
  PostContent,
  getAllPost,
} from "../controllers/post/post.controller";

const postRouter = router.Router();
postRouter.get("/", EnsureLoggedIn, getAllPost);
postRouter.get("/:repo/post", EnsureLoggedIn, PostContent);
postRouter.get("/:id", EnsureLoggedIn, getPostById);

export default postRouter;
