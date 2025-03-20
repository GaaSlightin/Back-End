import { NextFunction, Request, Response } from "express";
import { IAuthRequest } from "../../interfaces/auth.interfaces";
import { IPost } from "../../interfaces/github.interface";
import { createPost } from "../../utils/aiClient";
import PostModel from "../../models/post.model";
import { errorHandler } from "../../middleware/errorHandler.middleware";

export const getAllPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as IAuthRequest).user._id;
    const posts = await PostModel.find({ userId });
    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
};
export const PostContent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as IAuthRequest).user._id;
    const repo = req.body;

    const { title, content } = await createPost(repo);
    const newPost = new PostModel({
      userId,
      title,
      content,
    });
    if (!title || !content) {
      res.status(400).json({
        status: "fail",
        message: "Title and Content are required",
      });
      return;
    }

    const post = await newPost.save();

    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
};

export const getPostById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as IAuthRequest).user._id;
    if (!userId) res.status(400).json({ message: "User not authorized" });

    const postId = req.params.id;
    const post = await PostModel.findOne({ userId, _id: postId }).lean();
    if (!post) res.status(404).json({ message: "Post not found" });

    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};
