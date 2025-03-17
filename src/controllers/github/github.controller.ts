import { Request, Response, NextFunction } from "express";
import axios from "axios";
import  {IFetchRepoResponse}  from "../../interfaces/auth.interfaces";

export const FetchUserRepo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { handler } = req.params; // Extract the handler parameter
    if (!handler) {
      res.status(400).json({
        status: "fail",
        message: "Handler parameter is required",
      });
      return;
    }

    const repoUrl = `https://api.github.com/users/${handler}/repos`;
    const response = await axios.get<IFetchRepoResponse[]>(repoUrl); // Explicitly type the response data
    const repos = response.data[0];

    if (!repos /*|| repos.length === 0*/) {
      res.status(404).json({
        status: "fail",
        message: "No repositories found for this user",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      data: repos,
    });
  } catch (error: any) {
    next(error);
  }
};