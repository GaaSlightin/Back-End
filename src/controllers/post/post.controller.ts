import { NextFunction, Request, Response } from "express";
import { IAuthRequest } from "../../interfaces/auth.interfaces";
import { IPost } from "../../interfaces/github.interface";
import { createPost } from "../../utils/aiClient";
import PostModel from "../../models/post.model";
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
